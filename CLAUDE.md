# BRAIN-TREE

> **TL;DR:** Client-only silnik wizualizacji drzew wiedzy. Dane z GitHub (org `gniazdo-wiedzy`), cache w IndexedDB, dwa widoki: metro (SVG) + galaktyka (3D). Zero backendu.

React 19, Zustand, react-three-fiber, Tailwind 3, Vite 7.

## Dane — GitHub jako backend

Org: `github.com/gniazdo-wiedzy`. Repozytoria = paczki wiedzy, wykrywane po topicach.

### Typy paczek

| Topic | Typ | Zawiera |
|-------|-----|---------|
| `paczka-bazowa` | Baza | `SkillTreeDef` — kompletne drzewo |
| `paczka-rozszerzenie` | Rozszerzenie | `TreePack` — nowe wezly/krawedzie do bazy |
| `paczka-kontentowa` | Kontent | `ContentPack` — definicje/fiszki/pytania do wezlow |

Tagi: `brain-tree` (system) + typ paczki + przedmiot (`polski`, `biologia`...).

Kazde repo ma `tree.json` na branchu `main`.

### Schemat danych

```typescript
SkillTreeDef { id, title, description?, branches, nodes, edges }
TreeNode { id, title, branch, tier, description?, bridgeTo?, terms? }
TreeEdge { from, to, type: 'progression' | 'branch' | 'bridge' }
TreePack { id, baseId, title, nodes, edges }
ContentPack { id, baseId, title, content: Record<nodeId, ContentItem[]> }
ContentItem { type: 'definition' | 'flashcard' | 'question', text, answer? }
```

## Architektura

```
/                          → Catalog (lista paczek z GitHub)
/load/:org/:repo           → Loader (fetch + cache + load)
/metro                     → MetroMap (SVG, schemat kolejowy)
/galaxy                    → TreeScene (3D, uklady sloneczne)
```

| Plik | Rola |
|------|------|
| `shared/types.ts` | Typy: SkillTreeDef, TreePack, ContentPack, PackEntry |
| `shared/graph.ts` | Auto-layout: kolumny z branches, tiery jako wiersze |
| `shared/store.ts` | Zustand: load, loadExtension, loadContent |
| `shared/github.ts` | Fetch: katalog po topicach, tree.json z raw.githubusercontent |
| `shared/cache.ts` | IndexedDB: get/set, offline po pierwszym pobraniu |
| `features/catalog/` | Ekran startowy: wybor drzewa wiedzy |
| `features/loader/` | Ladowanie paczki z URL (tez direct link) |
| `features/metro/` | Widok metro: SVG, Beck-style |
| `features/galaxy/` | Widok galaktyka: 3D, uklady sloneczne na spirali |
| `features/node-panel/` | Panel info: szczegoly wezla + content items |

## Warstwy systemu

```
WARSTWA 3:  Stan ucznia (discovery, progress, unlocks)    ← TODO
WARSTWA 2:  Tresci (content, definicje, egzaminy)         ← paczka-kontentowa
WARSTWA 1:  Graf wiedzy (nodes, edges, branches, terms)   ← paczka-bazowa + rozszerzenia
```

## Galaxy — uklady sloneczne

- Backbone (epoki) = slonca na spirali w plaszczyznie XZ
- Planety = wezly orbitujace wokol macierzystego slonca (1-2 hopy po krawedziach)
- Bridge = asteroidy na dalszych orbitach
- Mastered slonca emituja pointLight — realnie oswietlaja planety
- CameraRig: fly-to na klik, auto-rotate, damping

## Zasady

- Client-only, zero backendu (GitHub = CMS)
- Minimalny kod, zero redundancji
- Komentarze po polsku
- Silnik generyczny — dane wejsciowe decyduja o przedmiocie
- Offline-first: IndexedDB cache
