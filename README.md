# Vinted Multi-Search Browser Extension

A Firefox browser extension for Vinted that lets you search for two items at once and find sellers who have both in their wardrobe. Just type Item A and Item B, choose a category if needed, and the extension finds the overlap for you.

---

## Installation Guide (English)

### Temporary vs Permanent — What's the difference?
* **Temporary Extension:** Loaded directly from a folder on your computer. It is removed automatically every time Firefox is closed. No installation required — just point Firefox to the `manifest.json` file. Works on all Firefox versions without any configuration changes.
* **Permanent Extension:** Installed once and stays active permanently, even after Firefox restarts. Requires a one-time change in `about:config` to allow unsigned extensions (`xpinstall.signatures.required` → `false`). Easier to use day-to-day.

### Method 1: Install as a Temporary Extension
Temporary extensions are loaded directly from a folder on your computer. They work until you close Firefox — after that, you need to reload them manually.

**Steps:**
1. Open Firefox and go to: `about:debugging` (type it directly in the address bar and press Enter).
2. Click "This Firefox" in the left sidebar.
3. Click the button "Load Temporary Add-on...".
4. Navigate to the folder where you extracted `vinted-multi-search`.
5. Select the file: `manifest.json`.
6. The extension is now active. You will see it listed under "Temporary Extensions".

*Note: No signing or approval is required — works with any Firefox version.*

### Method 2: Install as a Permanent Extension (.xpi file)
Installing via `.xpi` makes the extension permanent — it survives Firefox restarts and behaves like any extension installed from the Firefox Add-ons store. I recommend for this Firefox Developer Edition <3.

**STEP 1 — Allow unsigned extensions (One-time setting):**
1. Open Firefox and go to: `about:config`.
2. Accept the warning if prompted.
3. Search for: `xpinstall.signatures.required`.
4. Double-click it to set the value to: `false`.
5. Close the tab.

**STEP 2 — Install the .xpi file:**
1. Open Firefox and go to: `about:addons`.
2. Click the gear icon (⚙) in the top right corner.
3. Select "Install Add-on From File...".
4. Navigate to the `.xpi` file and select it.
5. Click "Add" when Firefox asks for confirmation.

*Note: To remove it, go to `about:addons` and click "Remove" next to the extension.*

---

## Instrukcja Instalacji (Polski)

Rozszerzenie do przeglądarki Firefox dla platformy Vinted. Pozwala na jednoczesne wyszukiwanie dwóch różnych przedmiotów u tego samego sprzedawcy. Po prostu wpisz Przedmiot A i Przedmiot B, wybierz kategorię, a wtyczka znajdzie dla Ciebie gotowe zestawy.

### Tymczasowe vs Stałe rozszerzenie — Jaka jest różnica?
* **Tymczasowe rozszerzenie:** Ładowane bezpośrednio z folderu na Twoim komputerze. Usuwane automatycznie za każdym razem, gdy zamykasz Firefoksa. Nie wymaga instalacji — wystarczy wskazać Firefoksowi plik `manifest.json`. Działa na wszystkich wersjach Firefoksa bez żadnych zmian w konfiguracji.
* **Stałe rozszerzenie:** Instalowane raz i pozostaje aktywne na stałe, nawet po restartach Firefoksa. Wymaga jednorazowej zmiany w `about:config`, aby zezwolić na niepodpisane rozszerzenia (`xpinstall.signatures.required` → `false`). Łatwiejsze w codziennym użytku.

### Metoda 1: Instalacja Tymczasowa
Tymczasowe rozszerzenia są ładowane bezpośrednio z folderu na Twoim komputerze. Działają do momentu zamknięcia Firefoksa — potem musisz załadować je ponownie ręcznie.

**Kroki:**
1. Otwórz Firefoksa i przejdź do: `about:debugging`.
2. Kliknij "Ten program Firefox" na lewym pasku bocznym.
3. Kliknij przycisk "Załaduj tymczasowy dodatek...".
4. Przejdź do folderu, w którym wypakowałeś `vinted-multi-search`.
5. Wybierz plik: `manifest.json`.

*Uwaga: Nie wymaga podpisywania ani zatwierdzania — działa z każdą wersją Firefoksa.*

### Metoda 2: Instalacja Stała (plik .xpi)
Instalacja z pliku `.xpi` sprawia, że rozszerzenie jest stałe — przetrwa restarty Firefoksa. Polecam do tego Firefox Developer Edition <3.

**KROK 1 — Zezwól na niepodpisane rozszerzenia (Jednorazowo):**
1. Otwórz Firefoksa i przejdź do: `about:config`.
2. Zaakceptuj ostrzeżenie, jeśli się pojawi.
3. Wyszukaj: `xpinstall.signatures.required`.
4. Kliknij dwukrotnie, aby ustawić wartość na: `false`.
5. Zamknij kartę.

**KROK 2 — Zainstaluj plik .xpi:**
1. Otwórz Firefoksa i przejdź do: `about:addons`.
2. Kliknij ikonę koła zębatego (⚙) w prawym górnym rogu.
3. Wybierz "Zainstaluj dodatek z pliku...".
4. Przejdź do pliku `.xpi` i wybierz go.
5. Kliknij "Dodaj", gdy Firefox poprosi o potwierdzenie.

*Uwaga: Aby usunąć rozszerzenie, przejdź do `about:addons` i kliknij "Usuń" obok rozszerzenia.*

Screenshots
<img width="1919" height="918" alt="obraz" src="https://github.com/user-attachments/assets/9166981c-5ef5-4174-a4c9-fb7a0a495b42" />

<img width="1919" height="917" alt="obraz" src="https://github.com/user-attachments/assets/b85ace8e-2ffb-47d3-88fe-2d36fe5b2aa2" />


