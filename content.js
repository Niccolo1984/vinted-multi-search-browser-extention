console.log("[Vinted Multi-Search v3.0] Skrypt załadowany!");

// ─── KONFIGURACJA ─────────────────────────────────────────────────────────────
const CONFIG = {
  // Zbieranie sprzedawców
  MAX_UNIQUE_SELLERS: 1000,     // ile unikalnych sprzedawców zbieramy per przedmiot
  MAX_PAGES_PER_ITEM: 25,       // twardy limit stron per przedmiot (zabezpieczenie)
  ITEMS_PER_PAGE: 96,           // max itemów na stronę (limit API Vinted)

  // Opóźnienia
  DELAY_BETWEEN_PAGES_MIN: 400, // między stronami — min (jitter)
  DELAY_BETWEEN_PAGES_MAX: 700, // między stronami — max (jitter)
  DELAY_BETWEEN_ITEMS_MIN: 3000,// między przedmiotem A i B — min (3s)
  DELAY_BETWEEN_ITEMS_MAX: 4000,// między przedmiotem A i B — max (4s)
  SAFETY_PAUSE_EVERY: 5,        // długa przerwa co ile stron
  SAFETY_PAUSE_MIN: 4000,       // długa przerwa — min (4s)
  SAFETY_PAUSE_MAX: 6000,       // długa przerwa — max (6s)

  // Obsługa błędów
  RATE_LIMIT_WAIT_MS: 30000,    // czekanie po 429 przed ponowieniem tej samej strony
  MAX_RETRIES: 2,               // ile razy ponowić stronę po 429
};

// ─── BEZPIECZEŃSTWO ───────────────────────────────────────────────────────────
// Dane z zewnętrznego API (tytuły, loginy) NIGDY nie trafiają do innerHTML
// bez ucieczki — zapobiega XSS nawet jeśli API zwróci złośliwe dane.
function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}


const VINTED_ORIGIN = window.location.origin;

let isPaused    = false;
let isCancelled = false;

// Cache kategorii — pobierane raz przy starcie, trzymane w pamięci
let categoriesCache   = null;
let categoriesPromise = null; // zapobiega podwójnemu requestowi

// ─── POBIERANIE KATEGORII ─────────────────────────────────────────────────────
async function loadCategories() {
  if (categoriesCache) return categoriesCache;
  if (categoriesPromise) return categoriesPromise; // czekaj na trwający request

  categoriesPromise = (async () => {
    try {
      const res = await fetch(`${VINTED_ORIGIN}/api/v2/catalog/initializers?page=catalog`, {
        headers: {
          "X-Requested-With": "XMLHttpRequest",
          "Accept": "application/json, text/javascript, */*; q=0.01",
        },
        credentials: "include",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      categoriesCache = data?.dtos?.catalogs || [];
      console.log(`[VMS] Załadowano ${categoriesCache.length} głównych kategorii.`);
    } catch (e) {
      console.warn("[VMS] Nie udało się pobrać kategorii:", e);
      categoriesCache = [];
      // Poinformuj użytkownika że kategorie są niedostępne
      ["1", "2"].forEach(n => {
        const btn = document.getElementById(`vms-catbtn${n}`);
        if (btn) { btn.textContent = "Kategorie niedostępne"; btn.disabled = true; }
      });
    }
    return categoriesCache;
  })();

  return categoriesPromise;
}

// Konwertuje drzewo Vinted na płaską listę z poziomami (łatwiejsza do renderowania)
function flattenCategories(cats, level = 0, result = []) {
  for (const cat of cats) {
    const hasChildren = cat.catalogs?.length > 0;
    result.push({ id: String(cat.id), title: cat.title, level, hasChildren });
    if (hasChildren) flattenCategories(cat.catalogs, level + 1, result);
  }
  return result;
}

// Stan dropdownów
const catState = {
  1: { value: "", open: false, collapsed: new Set() },
  2: { value: "", open: false, collapsed: new Set() },
};

let flatCats = []; // wspólna lista dla obu dropdownów

function renderDropdown(n) {
  const state   = catState[n];
  const drawer  = document.getElementById(`vms-catdrawer${n}`);
  const btn     = document.getElementById(`vms-catbtn${n}`);
  if (!drawer || !btn) return;

  // Zbieramy które ID mają widoczne dzieci
  const hiddenIds = new Set();
  for (const cat of flatCats) {
    if (cat.hasChildren && state.collapsed.has(cat.id)) {
      // Ukryj wszystkich potomków tego węzła
      let depth = cat.level;
      let hiding = false;
      for (const c of flatCats) {
        if (c === cat) { hiding = true; continue; }
        if (hiding) {
          if (c.level > depth) hiddenIds.add(c.id);
          else break;
        }
      }
    }
  }

  const items = flatCats
    .filter(cat => !hiddenIds.has(cat.id))
    .map(cat => {
      const indent  = cat.level * 16;
      const isSelected = cat.id === state.value;
      const arrow = cat.hasChildren
        ? `<span class="vms-dd-arrow" data-id="${escapeHtml(cat.id)}">${state.collapsed.has(cat.id) ? "▶" : "▼"}</span>`
        : `<span class="vms-dd-arrow vms-dd-arrow--leaf"></span>`;
      return `<div class="vms-dd-item${isSelected ? " vms-dd-item--selected" : ""}"
                   data-id="${escapeHtml(cat.id)}" data-title="${escapeHtml(cat.title)}" data-level="${cat.level}"
                   style="padding-left:${10 + indent}px">
                ${arrow}
                <span class="vms-dd-label">${escapeHtml(cat.title)}</span>
              </div>`;
    }).join("");

  drawer.innerHTML = `
    <div class="vms-dd-reset" data-action="reset">✕ Wszystkie kategorie</div>
    ${items}
  `;

  drawer.style.display = state.open ? "block" : "none";

  // Aktualizuj etykietę przycisku
  if (state.value) {
    const found = flatCats.find(c => c.id === state.value);
    btn.textContent = found ? `${found.title} ▾` : "Wszystkie kategorie ▾";
  } else {
    btn.textContent = "Wszystkie kategorie ▾";
  }
}

function initCategoryDropdowns() {
  // Jeden globalny listener na całym panelu — niezawodny, bez problemów z bubbling
  const panel = document.getElementById("vms-panel");
  if (!panel) return;

  panel.addEventListener("click", (e) => {
    // Kliknięcie przycisku otwierającego
    const btn = e.target.closest(".vms-catbtn");
    if (btn) {
      const n = btn.dataset.n;
      const wasOpen = catState[n].open;
      // Zamknij oba
      catState[1].open = false;
      catState[2].open = false;
      // Otwórz kliknięty (jeśli był zamknięty)
      catState[n].open = !wasOpen;
      renderDropdown(1);
      renderDropdown(2);
      return;
    }

    // Kliknięcie strzałki — rozwiń/zwiń
    const arrow = e.target.closest(".vms-dd-arrow:not(.vms-dd-arrow--leaf)");
    if (arrow) {
      const id = arrow.dataset.id;
      const n = catState[1].open ? "1" : "2";
      if (catState[n].collapsed.has(id)) {
        // Rozwijamy — zwijamy wszystkich bezpośrednich potomków którzy mają dzieci
        catState[n].collapsed.delete(id);
        const parent = flatCats.find(c => c.id === id);
        if (parent) {
          let inChildren = false;
          for (const c of flatCats) {
            if (c === parent) { inChildren = true; continue; }
            if (inChildren) {
              if (c.level <= parent.level) break;
              if (c.hasChildren) catState[n].collapsed.add(c.id);
            }
          }
        }
      } else {
        catState[n].collapsed.add(id);
      }
      renderDropdown(n);
      return;
    }

    // Kliknięcie resetu
    const reset = e.target.closest("[data-action='reset']");
    if (reset) {
      const n = catState[1].open ? "1" : "2";
      catState[n].value = "";
      catState[n].open  = false;
      document.getElementById(`vms-cat${n}`).value = "";
      renderDropdown(n);
      return;
    }

    // Kliknięcie pozycji listy
    const item = e.target.closest(".vms-dd-item");
    if (item) {
      const n = catState[1].open ? "1" : "2";
      const id    = item.dataset.id;
      const title = item.dataset.title;
      catState[n].value = id;
      catState[n].open  = false;
      document.getElementById(`vms-cat${n}`).value = id;
      renderDropdown(n);
      return;
    }

    // Kliknięcie poza dropdownem — zamknij oba
    catState[1].open = false;
    catState[2].open = false;
    renderDropdown(1);
    renderDropdown(2);
  });
}

async function populateCategoryDropdowns() {
  const cats = await loadCategories();
  if (!cats.length) return;

  flatCats = flattenCategories(cats);

  // Domyślnie zwiń wszystkie kategorie główne (level 0 z dziećmi)
  [1, 2].forEach(n => {
    flatCats.forEach(c => { if (c.level === 0 && c.hasChildren) catState[n].collapsed.add(c.id); });
    renderDropdown(n);
  });
}

// ─── UI ───────────────────────────────────────────────────────────────────────
function injectUI() {
  if (document.getElementById("vms-panel")) return true; // już wstrzyknięty
  const header = document.querySelector("header") || document.body.firstElementChild;
  if (!header) return false;

  // Upewnij się że wstawiamy za headerem a nie w środku React tree
  if (!header.parentNode) return false;

  const panel = document.createElement("div");
  panel.id = "vms-panel";
  panel.innerHTML = `
    <div class="vms-container">
      <span class="vms-title">
        <span style="font-size:18px;margin-right:4px;color:#676c6f">⌕</span>Szukaj zestawu
      </span>
      <div class="vms-inputs">
        <div class="vms-input-group">
          <input type="text" id="vms-item1" placeholder="Przedmiot A (np. kurtka)" />
          <div class="vms-catpicker">
            <button type="button" id="vms-catbtn1" class="vms-catbtn" data-n="1">Wszystkie kategorie ▾</button>
            <div id="vms-catdrawer1" class="vms-catdrawer" style="display:none"></div>
            <input type="hidden" id="vms-cat1" value="" />
          </div>
        </div>
        <span class="vms-plus">+</span>
        <div class="vms-input-group">
          <input type="text" id="vms-item2" placeholder="Przedmiot B (np. czapka)" />
          <div class="vms-catpicker">
            <button type="button" id="vms-catbtn2" class="vms-catbtn" data-n="2">Wszystkie kategorie ▾</button>
            <div id="vms-catdrawer2" class="vms-catdrawer" style="display:none"></div>
            <input type="hidden" id="vms-cat2" value="" />
          </div>
        </div>
      </div>
      <div class="vms-buttons">
        <button id="vms-search-btn">Znajdź wspólnych sprzedawców</button>
        <button id="vms-pause-btn"  style="display:none">⏸ Pauza</button>
        <button id="vms-cancel-btn" style="display:none">✕ Anuluj</button>
      </div>
      <div id="vms-status"  class="vms-status"  style="display:none"></div>
      <div id="vms-results" class="vms-results" style="display:none"></div>
    </div>
  `;
  header.parentNode.insertBefore(panel, header.nextSibling);

  document.getElementById("vms-search-btn").addEventListener("click", handleSearch);
  document.getElementById("vms-pause-btn").addEventListener("click", handlePause);
  document.getElementById("vms-cancel-btn").addEventListener("click", handleCancel);

  initCategoryDropdowns();
  populateCategoryDropdowns();
  return true; // sygnał dla observera że wstrzyknięcie się powiodło
}

// ─── STEROWANIE ───────────────────────────────────────────────────────────────
function handlePause() {
  const btn = document.getElementById("vms-pause-btn");
  isPaused = !isPaused;
  btn.textContent = isPaused ? "▶ Wznów" : "⏸ Pauza";
  setStatus(isPaused
    ? "⏸ Wstrzymano — kliknij Wznów aby kontynuować."
    : "Wznowiono skanowanie..."
  );
}

function handleCancel() {
  isCancelled = true;
  isPaused    = false;
  setStatus("Anulowano skanowanie.", true);
  setScanningUI(false);
}

function setScanningUI(scanning) {
  const searchBtn = document.getElementById("vms-search-btn");
  const pauseBtn  = document.getElementById("vms-pause-btn");
  const cancelBtn = document.getElementById("vms-cancel-btn");
  if (!searchBtn) return;

  searchBtn.disabled    = scanning;
  searchBtn.textContent = scanning ? "Szukam..." : "Znajdź wspólnych sprzedawców";
  if (pauseBtn)  pauseBtn.style.display  = scanning ? "inline-block" : "none";
  if (cancelBtn) cancelBtn.style.display = scanning ? "inline-block" : "none";

  if (scanning) {
    isPaused    = false;
    isCancelled = false;
    if (pauseBtn) pauseBtn.textContent = "⏸ Pauza";
  }
}

// ─── POMOCNICZE ───────────────────────────────────────────────────────────────
function setStatus(msg, isError = false, isHtml = false) {
  const el = document.getElementById("vms-status");
  if (!el) return;
  el.style.display = "block";
  el.className     = "vms-status" + (isError ? " vms-error" : "");
  if (isHtml) el.innerHTML = msg;
  else        el.textContent = msg;
}

function showResults(matches, item1, item2) {
  const el = document.getElementById("vms-results");
  if (!el) return;
  el.style.display = "block";

  if (matches.length === 0) {
    el.innerHTML = `<p class="vms-no-results">Brak wspólnych sprzedawców dla tych przedmiotów.</p>`;
    return;
  }

  el.innerHTML = `
    <ul class="vms-list">
      ${matches.map((m) => `
        <li>
          <a class="vms-seller" href="${escapeHtml(m.profileUrl)}" target="_blank">@${escapeHtml(m.username)}</a>
          <span class="vms-counts">(${m.itemA.count} szt. A, ${m.itemB.count} szt. B)</span>
          <span class="vms-total-price">${m.totalPrice.toFixed(2)} zł</span>:
          <a class="vms-item" href="${escapeHtml(m.itemA.url)}" target="_blank">${escapeHtml(m.itemA.title)}</a>
          <span class="vms-plus">+</span>
          <a class="vms-item" href="${escapeHtml(m.itemB.url)}" target="_blank">${escapeHtml(m.itemB.title)}</a>
        </li>`
      ).join("")}
    </ul>
  `;
}

// Losowe opóźnienie w podanym zakresie
function randomDelay(minMs, maxMs) {
  const ms = minMs + Math.random() * (maxMs - minMs);
  return new Promise((r) => setTimeout(r, Math.round(ms)));
}

// Aktywne czekanie podczas pauzy
async function waitIfPaused() {
  while (isPaused && !isCancelled) {
    await new Promise((r) => setTimeout(r, 500));
  }
}

// ─── CORE: Vinted API z obsługą 429 i ponowieniem ────────────────────────────
// Kluczowa różnica vs v1.0: przy 429 NIE pomijamy strony — ponawiamy ją
// po odczekaniu. Dane nie są tracone.
async function fetchVintedAPI(params, retryCount = 0) {
  const url = new URL(`${VINTED_ORIGIN}/api/v2/catalog/items`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), {
    headers: {
      "X-Requested-With": "XMLHttpRequest",
      "Accept": "application/json, text/javascript, */*; q=0.01",
    },
    credentials: "include",
  });

  if (res.status === 429) {
    if (retryCount >= CONFIG.MAX_RETRIES) {
      console.warn(`[VMS] 429 — wyczerpano ponowienia dla: ${url}`);
      return null;
    }
    console.warn(`[VMS] 429 — czekam ${CONFIG.RATE_LIMIT_WAIT_MS / 1000}s, ponowienie ${retryCount + 1}/${CONFIG.MAX_RETRIES}...`);
    setStatus(`⚠️ Serwer spowalnia zapytania — czekam ${CONFIG.RATE_LIMIT_WAIT_MS / 1000}s i ponawiam...`);
    await new Promise((r) => setTimeout(r, CONFIG.RATE_LIMIT_WAIT_MS));
    return fetchVintedAPI(params, retryCount + 1); // ponów TĘ SAMĄ stronę
  }

  if (res.status === 400) {
    // 400 = Vinted mówi "ta strona nie istnieje" — normalny koniec wyników
    // NIE logujemy jako błąd, zwracamy specjalny sygnał
    return { _endOfResults: true };
  }

  if (!res.ok) {
    console.warn(`[VMS] HTTP ${res.status} dla: ${url}`);
    return null;
  }

  return res.json();
}

// ─── ZBIERANIE SPRZEDAWCÓW DLA JEDNEGO PRZEDMIOTU ────────────────────────────
// ARCHITEKTURA v2.0:
// Zamiast sprawdzać każdą szafę osobnym requestem (v1.0: 100 requestów),
// zbieramy pełne listy sprzedawców dla obu przedmiotów (max ~50 requestów łącznie),
// a następnie porównujemy je lokalnie w JS — zero dodatkowych requestów.
//
// Zabezpieczenia między stronami:
// - 500ms między kolejnymi stronami (naturalny scrolling/paginacja)
// - losowa przerwa 4-6s co 5 stron (symuluje czytanie wyników)
// - brak przerw "bot-like" z równymi interwałami
async function collectSellers(searchText, label, categoryId = "") {
  // user.id → { username, profileUrl, cheapestItem: {title, url, price}, count }
  const sellers = new Map();
  let page = 1;

  while (page <= CONFIG.MAX_PAGES_PER_ITEM) {
    if (isCancelled) break;
    await waitIfPaused();
    if (isCancelled) break;

    setStatus(
      `Zbieram sprzedawców ${label} "${searchText}" ` +
      `(strona ${page}/${CONFIG.MAX_PAGES_PER_ITEM}, ` +
      `unikalni: ${sellers.size}/${CONFIG.MAX_UNIQUE_SELLERS})...`
    );

    const params = {
      search_text: searchText,
      per_page:    CONFIG.ITEMS_PER_PAGE,
      page,
      order:       "newest_first",
    };
    // Dodajemy katalog tylko jeśli użytkownik wybrał kategorię
    if (categoryId) params["catalog_ids[]"] = categoryId;

    const data = await fetchVintedAPI(params);

    if (!data?.items?.length || data._endOfResults) {
      if (data?._endOfResults) {
        console.log(`[VMS] ${label}: koniec wyników na stronie ${page} (HTTP 400).`);
      } else {
        console.log(`[VMS] ${label}: brak wyników na stronie ${page} — koniec.`);
      }
      break;
    }

    for (const item of data.items) {
      if (item.user?.id && item.user?.login) {
        const userId    = item.user.id;
        const itemPrice = parseFloat(item.price?.amount ?? "0");
        if (!item.price?.amount) {
          console.warn(`[VMS] Brak ceny dla ogłoszenia: ${item.url} — przypisano 0`);
        }
        const itemData  = {
          title: item.title || searchText,
          url:   item.url,
          price: itemPrice,
        };

        if (!sellers.has(userId)) {
          sellers.set(userId, {
            username:     item.user.login,
            profileUrl:   item.user.profile_url || `${VINTED_ORIGIN}/member/${userId}`,
            cheapestItem: itemData,
            count:        1,
          });
        } else {
          const existing = sellers.get(userId);
          existing.count++;
          // Zapamiętujemy najtańszy item — zero dodatkowych requestów,
          // dane już są w odpowiedzi API
          if (itemPrice < existing.cheapestItem.price) {
            existing.cheapestItem = itemData;
          }
        }
      }
    }

    console.log(`[VMS] ${label}, strona ${page}: ${sellers.size} unikalnych sprzedawców`);

    // Osiągnięto limit unikalnych sprzedawców
    if (sellers.size >= CONFIG.MAX_UNIQUE_SELLERS) {
      console.log(`[VMS] ${label}: osiągnięto limit ${CONFIG.MAX_UNIQUE_SELLERS} sprzedawców.`);
      break;
    }

    page++;
    if (page > CONFIG.MAX_PAGES_PER_ITEM) break;

    // Przerwa bezpieczeństwa co SAFETY_PAUSE_EVERY stron
    if ((page - 1) % CONFIG.SAFETY_PAUSE_EVERY === 0) {
      const pauseMs = Math.round(
        CONFIG.SAFETY_PAUSE_MIN +
        Math.random() * (CONFIG.SAFETY_PAUSE_MAX - CONFIG.SAFETY_PAUSE_MIN)
      );
      console.log(`[VMS] ${label}: przerwa bezpieczeństwa ${pauseMs}ms po ${page - 1} stronach`);
      setStatus(`Przerwa bezpieczeństwa ${label}... (${sellers.size} sprzedawców)`);
      await new Promise((r) => setTimeout(r, pauseMs));
    } else {
      // Krótka przerwa między stronami z jitterem — naturalny scrolling/paginacja
      await randomDelay(CONFIG.DELAY_BETWEEN_PAGES_MIN, CONFIG.DELAY_BETWEEN_PAGES_MAX);
    }
  }

  return sellers; // Map: userId → { username, profileUrl }
}

// ─── PORÓWNANIE LIST — ZERO REQUESTÓW ────────────────────────────────────────
// Przecięcie dwóch Map po user.id — dzieje się lokalnie w przeglądarce.
// Vinted w ogóle tego nie widzi.
function findCommonSellers(sellersA, sellersB) {
  const matches = [];

  for (const [userId, infoA] of sellersA) {
    if (sellersB.has(userId)) {
      const infoB        = sellersB.get(userId);
      const sameItem     = infoA.cheapestItem.url === infoB.cheapestItem.url;
      // Jeśli A i B to to samo ogłoszenie — nie podwajamy ceny
      const totalPrice   = sameItem
        ? infoA.cheapestItem.price
        : infoA.cheapestItem.price + infoB.cheapestItem.price;

      matches.push({
        userId,
        username:   infoA.username,
        profileUrl: infoA.profileUrl,
        itemA:      { ...infoA.cheapestItem, count: infoA.count },
        itemB:      { ...infoB.cheapestItem, count: infoB.count },
        totalPrice,
        sameItem,
      });
    }
  }

  matches.sort((a, b) => a.totalPrice - b.totalPrice);
  return matches;
}

// ─── GŁÓWNA LOGIKA ────────────────────────────────────────────────────────────
async function handleSearch() {
  // Reset przed odczytem inputów — zamyka okno wyścigu między Anuluj a nowym Szukaj
  isCancelled = false;
  isPaused    = false;

  const item1     = document.getElementById("vms-item1").value.trim();
  const item2     = document.getElementById("vms-item2").value.trim();
  const cat1      = document.getElementById("vms-cat1")?.value || "";
  const cat2      = document.getElementById("vms-cat2")?.value || "";
  const resultsEl = document.getElementById("vms-results");

  if (!item1 || !item2) { alert("Wpisz oba przedmioty!"); return; }

  setScanningUI(true);
  if (resultsEl) resultsEl.style.display = "none";

  try {
    // ── KROK 1: zbierz sprzedawców przedmiotu A ──────────────────────────────
    const sellersA = await collectSellers(item1, "A", cat1);
    if (isCancelled) return;

    if (sellersA.size === 0) {
      setStatus(`Nie znaleziono wyników dla "${item1}". Spróbuj innego słowa.`, true);
      return;
    }

    console.log(`[VMS] Przedmiot A "${item1}": ${sellersA.size} unikalnych sprzedawców`);
    setStatus(`Przedmiot A: ${sellersA.size} sprzedawców. Czekam przed wyszukaniem B...`);

    // ── PRZERWA MIĘDZY A i B — naturalna jak wpisanie nowego słowa ───────────
    await randomDelay(CONFIG.DELAY_BETWEEN_ITEMS_MIN, CONFIG.DELAY_BETWEEN_ITEMS_MAX);
    if (isCancelled) return;

    // ── KROK 2: zbierz sprzedawców przedmiotu B ──────────────────────────────
    const sellersB = await collectSellers(item2, "B", cat2);
    if (isCancelled) return;

    if (sellersB.size === 0) {
      setStatus(`Nie znaleziono wyników dla "${item2}". Spróbuj innego słowa.`, true);
      return;
    }

    console.log(`[VMS] Przedmiot B "${item2}": ${sellersB.size} unikalnych sprzedawców`);

    // ── KROK 3: porównanie lokalne — 0 requestów ─────────────────────────────
    setStatus(`Porównuję listy lokalnie... (${sellersA.size} × ${sellersB.size} sprzedawców)`);
    const matches = findCommonSellers(sellersA, sellersB);

    console.log(`[VMS] Wynik: ${matches.length} wspólnych sprzedawców`);

    // ── WYNIKI ───────────────────────────────────────────────────────────────
    setStatus(
      matches.length > 0
        ? `✔ Znaleziono <strong style="color:#007680">${matches.length}</strong> sprzedawców z oboma przedmiotami. (A: ${sellersA.size}, B: ${sellersB.size})`
        : `Brak wspólnych sprzedawców. (A: ${sellersA.size}, B: ${sellersB.size})`,
      false,
      true
    );
    showResults(matches, item1, item2);

    console.log("=== [VMS v3.0] WYNIKI ===");
    matches.forEach((m) =>
      console.log(
        `@${m.username} | ${m.totalPrice.toFixed(2)} zł | ` +
        (m.sameItem ? `zestaw: ${m.itemA.url}` : `A: ${m.itemA.url} | B: ${m.itemB.url}`)
      )
    );

  } catch (err) {
    console.error("[VMS] Krytyczny błąd:", err);
    setStatus("Wystąpił błąd. Sprawdź konsolę (F12).", true);
  } finally {
    setScanningUI(false);
  }
}

// ─── INICJALIZACJA ────────────────────────────────────────────────────────────
// Vinted używa Next.js — React hydration nadpisuje DOM po document_idle.
// Czekamy na sygnał że hydration się skończyła zanim wstrzykniemy panel.
function waitForHydration(callback) {
  // Next.js dispatch'uje zdarzenie routeChangeComplete po hydration SPA
  // Ale przy pierwszym załadowaniu strony tego zdarzenia nie ma —
  // obserwujemy czy #__NEXT_DATA__ istnieje i DOM jest stabilny.

  // Strategia: czekaj aż <header> pojawi się I przestanie być modyfikowany
  // przez minimum 300ms (React skończył hydration)
  let lastChange = Date.now();
  let headerFound = false;

  const observer = new MutationObserver(() => {
    lastChange = Date.now();
    if (document.querySelector("header")) headerFound = true;
  });

  observer.observe(document.body, { childList: true, subtree: true });

  const check = setInterval(() => {
    const now = Date.now();
    if (headerFound && (now - lastChange) > 300) {
      clearInterval(check);
      observer.disconnect();
      callback();
    }
  }, 100);
}

waitForHydration(() => {
  injectUI();

  // Po nawigacji SPA (Next.js router) — panel może zniknąć, reinjectuj
  window.addEventListener("popstate", () => setTimeout(injectUI, 400));

  // Nasłuchuj na Next.js route changes przez ich własny mechanizm
  const nextRouter = window.__NEXT_DATA__?.buildId;
  if (nextRouter) {
    // Obserwuj zmiany URL charakterystyczne dla SPA navigation
    let lastUrl = location.href;
    const urlObserver = new MutationObserver(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        setTimeout(injectUI, 400);
      }
    });
    urlObserver.observe(document.body, { childList: true, subtree: false });
  }
});
