# Vinted Multi-Search Browser Extension

A Firefox browser extension for Vinted that lets you search for two items at once and find sellers who have both in their wardrobe. Just type Item A and Item B, choose a category if needed, and the extension finds the overlap for you.

---

## Installation Guide (English)

### Temporary vs Permanent — What's the difference?
* [cite_start]**Temporary Extension:** Loaded directly from a folder on your computer[cite: 2]. [cite_start]It is removed automatically every time Firefox is closed[cite: 3]. [cite_start]No installation required — just point Firefox to the `manifest.json` file[cite: 4]. [cite_start]Works on all Firefox versions without any configuration changes[cite: 6].
* [cite_start]**Permanent Extension:** Installed once and stays active permanently, even after Firefox restarts[cite: 7]. [cite_start]Requires a one-time change in `about:config` to allow unsigned extensions (`xpinstall.signatures.required` → `false`)[cite: 9]. [cite_start]Easier to use day-to-day[cite: 10].

### Method 1: Install as a Temporary Extension
[cite_start]Temporary extensions are loaded directly from a folder on your computer[cite: 47]. [cite_start]They work until you close Firefox — after that, you need to reload them manually[cite: 48].

**Steps:**
1. [cite_start]Open Firefox and go to: `about:debugging` (type it directly in the address bar and press Enter)[cite: 49].
2. [cite_start]Click "This Firefox" in the left sidebar[cite: 49].
3. [cite_start]Click the button "Load Temporary Add-on..."[cite: 50].
4. [cite_start]Navigate to the folder where you extracted `vinted-multi-search`[cite: 50].
5. [cite_start]Select the file: `manifest.json`[cite: 51].
6. The extension is now active. [cite_start]You will see it listed under "Temporary Extensions"[cite: 51].

[cite_start]*Note: No signing or approval is required — works with any Firefox version[cite: 54].*

### Method 2: Install as a Permanent Extension (.xpi file)
[cite_start]Installing via `.xpi` makes the extension permanent — it survives Firefox restarts and behaves like any extension installed from the Firefox Add-ons store[cite: 29]. [cite_start]I recommend for this Firefox Developer Edition <3[cite: 38].

**STEP 1 — Allow unsigned extensions (One-time setting):**
1. [cite_start]Open Firefox and go to: `about:config`[cite: 31].
2. [cite_start]Accept the warning if prompted[cite: 31].
3. [cite_start]Search for: `xpinstall.signatures.required`[cite: 32].
4. [cite_start]Double-click it to set the value to: `false`[cite: 32].
5. [cite_start]Close the tab[cite: 32].

**STEP 2 — Install the .xpi file:**
1. [cite_start]Open Firefox and go to: `about:addons`[cite: 33].
2. [cite_start]Click the gear icon (⚙) in the top right corner[cite: 33].
3. [cite_start]Select "Install Add-on From File..."[cite: 34].
4. [cite_start]Navigate to the `.xpi` file and select it[cite: 34].
5. [cite_start]Click "Add" when Firefox asks for confirmation[cite: 35].

[cite_start]*Note: To remove it, go to `about:addons` and click "Remove" next to the extension[cite: 37].*

---

## Instrukcja Instalacji (Polski)

Rozszerzenie do przeglądarki Firefox dla platformy Vinted. Pozwala na jednoczesne wyszukiwanie dwóch różnych przedmiotów u tego samego sprzedawcy. Po prostu wpisz Przedmiot A i Przedmiot B, wybierz kategorię, a wtyczka znajdzie dla Ciebie gotowe zestawy.

### Tymczasowe vs Stałe rozszerzenie — Jaka jest różnica?
* [cite_start]**Tymczasowe rozszerzenie:** Ładowane bezpośrednio z folderu na Twoim komputerze[cite: 16]. [cite_start]Usuwane automatycznie za każdym razem, gdy zamykasz Firefoksa[cite: 17]. [cite_start]Nie wymaga instalacji — wystarczy wskazać Firefoksowi plik `manifest.json`[cite: 18]. [cite_start]Działa na wszystkich wersjach Firefoksa bez żadnych zmian w konfiguracji[cite: 20].
* [cite_start]**Stałe rozszerzenie:** Instalowane raz i pozostaje aktywne na stałe, nawet po restartach Firefoksa[cite: 21]. [cite_start]Wymaga jednorazowej zmiany w `about:config`, aby zezwolić na niepodpisane rozszerzenia (`xpinstall.signatures.required` → `false`)[cite: 23]. [cite_start]Łatwiejsze w codziennym użytku[cite: 24].

### Metoda 1: Instalacja Tymczasowa
[cite_start]Tymczasowe rozszerzenia są ładowane bezpośrednio z folderu na Twoim komputerze[cite: 55]. [cite_start]Działają do momentu zamknięcia Firefoksa — potem musisz załadować je ponownie ręcznie[cite: 56].

**Kroki:**
1. [cite_start]Otwórz Firefoksa i przejdź do: `about:debugging`[cite: 57].
2. [cite_start]Kliknij "Ten program Firefox" na lewym pasku bocznym[cite: 57].
3. [cite_start]Kliknij przycisk "Załaduj tymczasowy dodatek..."[cite: 58].
4. [cite_start]Przejdź do folderu, w którym wypakowałeś `vinted-multi-search`[cite: 58].
5. [cite_start]Wybierz plik: `manifest.json`[cite: 59].

[cite_start]*Uwaga: Nie wymaga podpisywania ani zatwierdzania — działa z każdą wersją Firefoksa[cite: 61].*

### Metoda 2: Instalacja Stała (plik .xpi)
[cite_start]Instalacja z pliku `.xpi` sprawia, że rozszerzenie jest stałe — przetrwa restarty Firefoksa[cite: 38]. [cite_start]Polecam do tego Firefox Developer Edition <3[cite: 46].

**KROK 1 — Zezwól na niepodpisane rozszerzenia (Jednorazowo):**
1. [cite_start]Otwórz Firefoksa i przejdź do: `about:config`[cite: 40].
2. [cite_start]Zaakceptuj ostrzeżenie, jeśli się pojawi[cite: 40].
3. [cite_start]Wyszukaj: `xpinstall.signatures.required`[cite: 41].
4. [cite_start]Kliknij dwukrotnie, aby ustawić wartość na: `false`[cite: 41].
5. [cite_start]Zamknij kartę[cite: 41].

**KROK 2 — Zainstaluj plik .xpi:**
1. [cite_start]Otwórz Firefoksa i przejdź do: `about:addons`[cite: 42].
2. [cite_start]Kliknij ikonę koła zębatego (⚙) w prawym górnym rogu[cite: 42].
3. [cite_start]Wybierz "Zainstaluj dodatek z pliku..."[cite: 43].
4. [cite_start]Przejdź do pliku `.xpi` i wybierz go[cite: 43].
5. [cite_start]Kliknij "Dodaj", gdy Firefox poprosi o potwierdzenie[cite: 44].

[cite_start]*Uwaga: Aby usunąć rozszerzenie, przejdź do `about:addons` i kliknij "Usuń" obok rozszerzenia[cite: 46].*
