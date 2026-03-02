# BRAIN-TREE

Generyczny silnik wizualizacji drzewa wiedzy (skill tree) dla dowolnego przedmiotu.
Client-only: React 19, Zustand, react-three-fiber, Tailwind 3, Vite 7.

## Schemat danych — SkillTreeDef

Jeden typ opisuje cale drzewo wiedzy dowolnego przedmiotu:

```typescript
SkillTreeDef {
  id, title, description?
  branches: Record<string, { label, color }>   // galęzie = kolumny
  nodes: TreeNode[]                             // wezly
  edges: TreeEdge[]                             // polaczenia
}

TreeNode { id, title, branch, tier, description?, bridgeTo?, terms? }
TreeEdge { from, to, type: 'progression' | 'branch' | 'bridge' }
```

- **branches** — kolejnosc kluczy = kolejnosc kolumn. Pierwsza = kregoslup.
- **tier** — wiersz (0 = gora, rosnie w dol). Epoki/dzialy jako backbone.
- **terms** — trudne slowa osadzone w kontekscie wezla (bez definicji na razie).
- **bridge** — specjalny klucz: wezly-mosty do innych przedmiotow.
- **Trzy typy krawedzi**: progression (kregoslup), branch (rozgalezienie), bridge (most).

## Uniwersalnosc — dowolny przedmiot

Schemat modeluje uniwersalna strukture wiedzy:
- Kregoslup (backbone / progression)
- Rozgalezienia (konkrety)
- Pojecia przekrojowe (motywy / procesy)
- Narzedzia (metody / warsztat)
- Mosty miedzy przedmiotami
- Trudne slowa osadzone w kontekscie

### J. Polski (matura 2026)

```
branches: { epoki, lektury, motywy, gatunki, warsztat, bridge }

epoki:    Antyk → Sredniowiecze → Renesans → ... → Wspolczesnosc
lektury:  Antygona, Makbet, Dziady III, Lalka, Ferdydurke, 1984...
motywy:   Bunt, Cierpienie, Wybor moralny, Patriotyzm, Totalitaryzm
gatunki:  Tragedia, Epos, Dramat, Satyra, Powiesc, Reportaz, Groteska
warsztat: Ironia, Monolog, Realizm, Symbol, Narracja, Rozprawka
bridge:   → Historia, → Filozofia, → WOS, → Historia sztuki
terms:    ['prometeizm', 'katharsis', 'nowomowa', 'groteska', ...]
```

### Biologia

```
branches: { dzialy, procesy, organizmy, metody, bridge }

dzialy:     Cytologia → Genetyka → Ewolucja → Ekologia
procesy:    Mitoza, Fotosynteza, Replikacja DNA, Dobor naturalny
organizmy:  Bakterie, Rosliny, Ssaki
metody:     Mikroskopia, Elektroforeza
bridge:     → Chemia (biochemia), → Fizyka (termodynamika)
terms:      ['allel', 'fenotyp', 'homeostaza', 'mitochondrium']
```

### Matematyka

```
branches: { dzialy, twierdzenia, metody, zastosowania, bridge }

dzialy:       Algebra → Funkcje → Analiza → Geometria
twierdzenia:  Pitagoras, Talesa, Tw. o wartosci sredniej
metody:       Dowod nie wprost, Indukcja, Metoda graficzna
bridge:       → Fizyka (wektory, kinematyka), → Informatyka (algorytmy)
terms:        ['asymptota', 'pochodna', 'dziedzina', 'aksjomat']
```

### Historia

```
branches: { epoki, wydarzenia, postacie, procesy, bridge }

epoki:       Starozytnosc → Sredniowiecze → Nowozytnosc → XX wiek
wydarzenia:  Rewolucja Francuska, Powstanie Styczniowe, II WS
postacie:    Cezar, Napoleon, Pilsudski
bridge:      → Polski (Dziady, Wesele), → Filozofia (Oswiecenie), → WOS (demokracja)
terms:       ['feudalizm', 'absolutyzm', 'suwerennosc', 'totalitaryzm']
```

## Architektura

| Plik | Rola |
|------|------|
| `types.ts` | Schemat: SkillTreeDef, TreeNode, TreeEdge, BranchDef |
| `graph.ts` | Auto-layout: kolumny z branches, tiery jako wiersze |
| `store.ts` | Zustand: load(SkillTreeDef) → pozycjonowanie → render |
| `NodeMesh.tsx` | Wezel 3D: sfera/diament, label, hover/select, dimming |
| `TreeScene.tsx` | Canvas r3f: naglowki kolumn, krawedzie, OrbitControls |
| `App.tsx` | Shell: tytul, legenda, panel info z terminami, hint |
| `skill-tree-data.ts` | Przykladowy dataset: matura z polskiego 2026 |

## Warstwy systemu

```
WARSTWA 3:  Stan ucznia (discovery, progress, unlocks)    ← TODO
WARSTWA 2:  Tresci (content, definicje, egzaminy)         ← TODO
WARSTWA 1:  Graf wiedzy (nodes, edges, branches, terms)   ← ZROBIONE
```

## Zasady

- Client-only, zero backendu
- Minimalny kod, zero redundancji
- Komentarze po polsku
- Silnik generyczny — dane wejsciowe decyduja o przedmiocie
