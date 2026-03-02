# BRAIN-TREE

> Wizualizacja drzew wiedzy dla dowolnego przedmiotu. Dwa widoki: metro (2D) + galaktyka (3D). Dane z GitHub, dziala offline.

**TL;DR:** Otwierasz app → wybierasz drzewo wiedzy → widzisz je jako schemat metra albo galaktyke ukladow slonecznych. Nauczyciele dodaja paczki wiedzy przez GitHub. Uczniowie ucza sie offline.

## Jak to dziala

```
Nauczyciel                          Uczen
    |                                 |
    | tworzy tree.json               | otwiera app
    | pushuje do GitHub              | wybiera drzewo
    |                                | pobiera → IndexedDB
    |                                | uczy sie offline
    |                                |
    ↓                                ↓
  github.com/gniazdo-wiedzy     app w przegladarce
```

## Paczki wiedzy

Kazde repo w organizacji [gniazdo-wiedzy](https://github.com/gniazdo-wiedzy) to paczka wiedzy.

| Typ | Co zawiera | Przyklad |
|-----|-----------|---------|
| **Bazowa** | Pelne drzewo wiedzy | `polski-matura-2026-minimum` |
| **Rozszerzenie** | Nowe wezly + krawedzie | `polski-motywy-zaawansowane` |
| **Kontentowa** | Definicje, fiszki, pytania | `polski-fiszki-pojecia` |

Paczki wykrywane automatycznie po tagach GitHub: `brain-tree` + typ + przedmiot.

## Uruchomienie

```bash
npm install
npm run dev
```

Otwiera sie katalog → kliknij drzewo → metro / galaktyka.

Direct link: `http://localhost:5173/load/gniazdo-wiedzy/polski-matura-2026-minimum`

## Stack

React 19 · Zustand · react-three-fiber · Tailwind 3 · Vite 7

Zero backendu. Zero bazy danych. GitHub = CMS. IndexedDB = cache.

## Organizacja: gniazdo-wiedzy

Docelowo wspierane przez model Bielik (SpeakLeash / AGH Krakow).

---

Projekt badawczy: [badania-zrodla.md](./badania-zrodla.md)
