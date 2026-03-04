# BRAIN-TREE

> **TL;DR:** Client-only silnik wizualizacji drzew wiedzy. Dane z GitHub (org `gniazdo-wiedzy`), cache w IndexedDB, widok galaktyka (3D). Zero backendu.

React 19, Zustand, react-three-fiber, Tailwind 3, Vite 7, Dexie.

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

Jedno zrodlo prawdy: `shared/pack-types.ts`

```typescript
SkillTreeDef { id, title, description?, branches, nodes, edges }
TreeNode { id, title, branch, tier, description?, bridgeTo? }
TreeEdge { from, to, type: 'progression' | 'branch' | 'bridge' }
TreePack { id, baseId, title, nodes, edges }
ContentPack { id, baseId, title, content: Record<nodeId, ContentItem[]> }
ContentItem { id?, type, text, answer?, cost?, forms? }
```

ContentItem.id jest opcjonalne w JSON-ach — generowane automatycznie przy ladowaniu jako `${packId}::${nodeId}::${index}`.

## Architektura

```
/                          → Catalog (lista paczek z GitHub)
/load/:org/:repo           → Loader (fetch + cache + load)
/galaxy                    → TreeScene (3D, uklady sloneczne)
/profile                   → UserPanel (minimapa materialu)
```

| Plik | Rola |
|------|------|
| `shared/pack-types.ts` | Schematy danych paczek — kontrakt z repozytoriami |
| `shared/types.ts` | Re-export pack-types + typy wewnetrzne (PackEntry) |
| `shared/graph.ts` | Galaxy layout: spirala, orbity, asteroidy |
| `shared/store.ts` | Zustand: load, loadExtension, loadContent, selekcja |
| `shared/github.ts` | Fetch: katalog po topicach, tree.json |
| `shared/cache.ts` | Dexie (IndexedDB): offline cache paczek |
| `features/catalog/` | Ekran startowy: wybor drzewa wiedzy |
| `features/loader/` | Ladowanie paczki z URL |
| `features/extensions/` | Shelf: ladowanie rozszerzen i contentu |
| `features/galaxy/` | Widok 3D: TreeScene + NodeMesh |
| `features/node-panel/` | Panel: szczegoly wezla + content items |
| `features/user/` | Profil: minimapa materialu |

## Warstwy systemu

```
WARSTWA 3:  Gamifikacja (progress, quizy, spaced repetition)  ← TODO (patrz nizej)
WARSTWA 2:  Tresci (content, definicje, fiszki)                ← paczka-kontentowa
WARSTWA 1:  Graf wiedzy (nodes, edges, branches)               ← paczka-bazowa + rozszerzenia
```

## TODO: Warstwa 3 — gamifikacja

Warstwa 3 zostala CELOWO wycieta. Poprzednia implementacja (monety, reveal, discovery, self-report progress) nie dzialala — nie uczyla, gmatwala, gubila ucznia.

Nowa warstwa 3 musi spelniac:
- **Musi dzialac jako gra** — feedback loop, nie dekoracja
- **Musi uczyc** — spaced repetition z prawdziwym quizem, nie samodeklaracja
- **Musi byc prosta** — uczen widzi CO robic, nie zastanawia sie DLACZEGO
- **Musi byc modularna** — osobny slice Zustand, zero ingerencji w warstwy 1-2
- **Badania:** edgeStr decay formula (hits/5 * exp(-0.1 * days)) jest gotowa, potrzebuje prawdziwego inputu (odpowiedzi na pytania, nie klikniecia)

Kontekst naukowy: ROADMAP-ERASMUS.md, ZGODNOSC-BADANIA.md

## Galaxy — uklady sloneczne

- Backbone (epoki) = slonca na spirali w plaszczyznie XZ
- Planety = wezly orbitujace wokol macierzystego slonca (1-2 hopy po krawedziach)
- Bridge = asteroidy na dalszych orbitach
- CameraRig: fly-to na klik, auto-rotate, damping

## Zasady

- Client-only, zero backendu (GitHub = CMS)
- Minimalny kod, zero redundancji — kazda linia musi dzialac
- Nie dodawaj efektow wizualnych bez potwierdzenia ze sa widoczne
- Komentarze po polsku
- Silnik generyczny — dane wejsciowe decyduja o przedmiocie
- Offline-first: IndexedDB cache (Dexie)
