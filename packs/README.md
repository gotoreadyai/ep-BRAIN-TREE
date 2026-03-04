# Paczki wiedzy

Lokalne kopie paczek z organizacji [gniazdo-wiedzy](https://github.com/gniazdo-wiedzy) na GitHubie.

## Typy paczek

| Typ | Topic GitHub | Plik | Struktura |
|-----|-------------|------|-----------|
| Baza | `paczka-bazowa` | `tree.json` → `SkillTreeDef` | Kompletne drzewo: branches, nodes, edges |
| Rozszerzenie | `paczka-rozszerzenie` | `tree.json` → `TreePack` | Nowe nodes/edges doklejane do bazy |
| Kontent | `paczka-kontentowa` | `tree.json` → `ContentPack` | Terminy, definicje, fiszki, pytania do istniejących nodes |

## Jak stworzyc nowa paczke

1. Utworz katalog w `packs/` z nazwa przyszlego repo:
   ```
   mkdir packs/polski-biblia-kontent
   ```

2. Napisz `tree.json` wedlug odpowiedniego schematu (patrz nizej).

3. Utworz repo w `gniazdo-wiedzy` i wypchnij:
   ```bash
   cd packs/polski-biblia-kontent
   git init -b main
   git add tree.json
   git commit -m "Biblia — terminy i pytania"
   gh repo create gniazdo-wiedzy/polski-biblia-kontent \
     --public \
     --description "Biblia — terminy i pytania" \
     --source . --push
   ```

4. Dodaj wymagane topici:
   ```bash
   gh repo edit gniazdo-wiedzy/polski-biblia-kontent \
     --add-topic brain-tree \
     --add-topic paczka-kontentowa \
     --add-topic polski
   ```

## Topici

Kazde repo musi miec:
- `brain-tree` — przynaleznosc do systemu
- typ paczki: `paczka-bazowa` | `paczka-rozszerzenie` | `paczka-kontentowa`
- przedmiot: `polski`, `biologia`, `historia`...

## Schemat ContentPack

```json
{
  "id": "polski-biblia-kontent",
  "baseId": "polski-matura-2026",
  "title": "Biblia — terminy i pytania",
  "content": {
    "biblia": [
      { "type": "term", "text": "genesis" },
      { "type": "definition", "text": "Ksiega Rodzaju — pierwsza ksiega Biblii..." },
      { "type": "flashcard", "text": "eschatologia", "answer": "Nauka o rzeczach ostatecznych...", "cost": 1 },
      { "type": "question", "text": "Jaka role pelni vanitas u Koheleta?", "answer": "...", "cost": 2 }
    ]
  }
}
```

### Typy ContentItem

| type | cost | Zachowanie |
|------|------|------------|
| `term` | 0 (domyslnie) | Widoczny od razu — kluczowe pojecie |
| `definition` | 0 (domyslnie) | Widoczny od razu — wyjasnienie |
| `flashcard` | 1+ | Ukryty za zdrapka — fiszka z odpowiedzia |
| `question` | 2+ | Ukryty za zdrapka — pytanie maturalne |

- `cost: 0` lub brak = darmowe, widoczne od razu
- `cost > 0` = ukryte, odsloniecie kosztuje monety

## Schemat TreePack (rozszerzenie)

```json
{
  "id": "polski-romantyzm-poglebiony",
  "baseId": "polski-matura-2026",
  "title": "Romantyzm poglębiony",
  "nodes": [
    { "id": "sonety", "title": "Sonety krymskie", "branch": "lektury", "tier": 4 }
  ],
  "edges": [
    { "from": "ballady", "to": "sonety", "type": "branch" }
  ]
}
```

## Konwencje

- `baseId` musi zgadzac sie z `id` paczki bazowej
- Klucze w `content` to ID istniejacych nodes z bazy
- Jedna paczka kontentowa moze pokrywac wiele nodes (np. antyk + antygona + mitologia)
- Albo byc waska — jeden node, jedno zagadnienie
