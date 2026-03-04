# Zgodnosc aplikacji z badaniami naukowymi

> Analiza: co mowi nauka vs co robi aplikacja KNOWLEDGE-NEST.
> Cel: identyfikacja luk, ktore trzeba zasypac zanim powolamy sie na te badania w aplikacji Erasmus+.

---

## LEGENDA

- ✅ ZGODNE — aplikacja realizuje to, co mowia badania
- 🟡 CZESCIOWE — mechanizm istnieje, ale niepelny lub powierzchowny
- ❌ NIEZGODNE — badanie mowi X, aplikacja robi co innego lub nic
- 💡 REKOMENDACJA — co zrobic, zeby byc zgodnym

---

## 1. SPACED REPETITION

### Kang, 2016 — SR skuteczniejsze niz masowe uczenie sie

| Twierdzenie | Stan w aplikacji |
|-------------|------------------|
| Rozlozone powtorki w czasie sa skuteczniejsze niz masowe uczenie | ❌ NIEZGODNE |
| SR powinno byc standardem w programach nauczania | ❌ NIEZGODNE |

**Co robi aplikacja:** System progresji jest binarny — uczen klika "Rozpocznij" → "Opanowane!" i wezel zmienia status. Nie ma zadnych powtórek, nie ma interwalow czasowych, nie ma powrotu do opanowanych wezlow. Raz opanowany = opanowany na zawsze.

**Problem:** Podpieranie sie Kangiem przy obecnym stanie aplikacji jest nieuczciwe — aplikacja nie implementuje SR w zadnej formie.

💡 **REKOMENDACJA:**
- Dodac pole `lastSeen: timestamp` i `hits: number` do stanu wezla
- Zaimplementowac formule z concept note: `strength = min(hits/5, 1) × e^(-0.1 × days)`
- Wezly "opanowane" powinny z czasem tracic sile i wracac do statusu wymagajacego powtorki
- Wizualizacja: jasnosc/swiecenie wezla = sila pamieci (decay w czasie)

---

### Maye et al., 2026 — Meta-analiza SR w edukacji medycznej (21 415 uczestnikow)

| Twierdzenie | Stan w aplikacji |
|-------------|------------------|
| SR skuteczne przy materialach wymagajacych dlugookresowej retencji | ❌ NIEZGODNE |
| Efekt istotny statystycznie na duzej probie | — (nie dotyczy implementacji) |

**Co robi aplikacja:** Flashcards i questions istnieja w ContentPack, ale sa jednorazowe — uczen odkrywa (za monety), czyta, i nigdy wiecej ich nie widzi. Zero powtórek.

**Problem:** Flashcards bez powtórek to nie spaced repetition — to po prostu flashcards. Badanie Maye et al. mowi o powtorkach w rosnacych interwalach, nie o jednorazowym pokazaniu.

💡 **REKOMENDACJA:**
- Content items (flashcard, question) powinny wracac do ucznia po wyliczonym interwale
- Implementacja: kolejka powtórek per wezel, oparta na decay formula
- Opcjonalnie: uczen ocenia "pamietam / nie pamietam" → interwaly sie dostosowuja

---

### PMC, 2017 — Optymalne interwaly rosna z czasem (rekonsolidacja pamieci)

| Twierdzenie | Stan w aplikacji |
|-------------|------------------|
| Krotsze interwaly na poczatku, dluzsze pozniej | ❌ NIEZGODNE |
| Podstawa do projektowania algorytmow adaptacyjnych | ❌ NIEZGODNE |

**Co robi aplikacja:** Brak jakichkolwiek interwalow. Brak logowania timestampow interakcji. localStorage przechowuje tylko binarny stan wezla (`mastered`/`in_progress`/`available`/`locked`).

**Problem:** Bez timestampow nie da sie nawet retrospektywnie obliczyc interwalow.

💡 **REKOMENDACJA:**
- Rozszerzyc `nodeStates` o:
  ```typescript
  interface NodeProgress {
    status: NodeStatus
    firstSeen: number    // timestamp
    lastSeen: number     // timestamp
    hits: number         // ile razy uczen wchodzil w interakcje
    strength: number     // obliczana dynamicznie
  }
  ```
- Decay formula: `strength = min(hits/5, 1) × e^(-0.1 × daysSinceLast)`
- Interwaly: 1d → 3d → 7d → 14d → 30d (rosnace, jak mowi badanie)

---

### PMC, 2022 — Uczniowie nie czuja ze SR dziala (mimo lepszych wynikow)

| Twierdzenie | Stan w aplikacji |
|-------------|------------------|
| Subiektywne poczucie vs obiektywne wyniki — rozbieznosc | — (nie dotyczy) |
| Potrzeba budowania zaufania do metody w UI | ❌ NIEZGODNE |

**Co robi aplikacja:** Brak jakiejkolwiek wizualizacji efektywnosci uczenia. UserPanel pokazuje tylko % opanowanych wezlow, nie dynamike nauki.

💡 **REKOMENDACJA:**
- Dodac wizualizacje sily pamieci: swiecace vs gasnace wezly w galaxy view
- Dashboard z wykresem: "Twoja pamiec vs czas" — pokazac uczniowi ze powtorki dzialaja
- Mikro-feedback: "Powtorzyles 3 pojecia — sila pamieci wzrosla o 15%"

---

## 2. KNOWLEDGE GRAPHS W EDUKACJI

### Heliyon, 2024 — Systematic review (120 prac): 5 zastosowan KG w edukacji

| Zastosowanie wg Heliyon | Stan w aplikacji |
|--------------------------|------------------|
| **Adaptive & Personalised Learning** — dopasowanie sciezki do postepu ucznia | 🟡 CZESCIOWE |
| **Curriculum Design** — strukturyzacja programu wokol relacji miedzy pojeciami | ✅ ZGODNE |
| **Concept Mapping & Visualization** — wizualna mapa polaczen w domenie | ✅ ZGODNE |
| **Semantic Search & QA** — inteligentne wyszukiwanie | ❌ NIEZGODNE |
| **Prerequisite Detection** — automatyczne wykrywanie co trzeba umiec zanim X | 🟡 CZESCIOWE |

**Co robi aplikacja dobrze:**
- Graf wiedzy JEST zaimplementowany (`SkillTreeDef` z `nodes` + `edges` + `branches`)
- Wizualizacja 3D galaxy view JEST concept mappingiem — unikalna w skali edtech
- Relacje prerequisite SA zakodowane w krawedziach (`progression`, `branch`, `bridge`)
- Curriculum design — drzewo modeluje program nauczania z tierami i branchami

**Gdzie jest luka:**
- **Adaptacja sciezki:** Sciezka jest STATYCZNA — zdeterminowana przez struktury drzewa. Kazdy uczen przechodzi te same wezly w tej samej kolejnosci. Badanie mowi o dopasowaniu sciezki do indywidualnego ucznia.
- **Prerequisite detection:** Relacje prerequisite sa RECZNE (autor paczki je definiuje), nie automatyczne. Badanie mowi o AI-assisted detection.
- **Search & QA:** Zero wyszukiwania. Uczen musi nawigowac wizualnie.

💡 **REKOMENDACJA:**
- Krotkoterminowo: dodac wyszukiwarke wezlow (filter/search w UI)
- Srednioterminowo: alternatywne sciezki — jesli uczen opanowal X szybko, zaproponuj skok do Y (adaptive)
- Dlugoterminowo (RAG API): semantic search po content packs

---

### MDPI Electronics, 2024 — KG pozwalaja systemom rozumiec strukture domeny

| Twierdzenie | Stan w aplikacji |
|-------------|------------------|
| KG pozwalaja rozumiec strukture, nie tylko fakty | ✅ ZGODNE |
| Najskuteczniejsze KG lacza NLP z ontologiami | ❌ NIEZGODNE |

**Co robi aplikacja dobrze:**
- Model danych JEST ontologia domenowa (branches = kategorie, edges = relacje, tiers = hierarchia)
- Wizualizacja POKAZUJE strukture, nie liste faktow — 3D galaxy z orbitami

**Gdzie jest luka:**
- Zero NLP — caly graf jest reczny
- Brak automatycznej ekstrakcji relacji z tresci

💡 **REKOMENDACJA:**
- Na etapie authoring tool: AI-assisted sugestie krawedzi na podstawie tresci content items
- Fazowe: najpierw recznie (jak teraz), pozniej AI-assisted

---

### JEDM — AI-assisted budowa KG z relacjami prerequisite

| Twierdzenie | Stan w aplikacji |
|-------------|------------------|
| AI buduje grafy z relacjami prerequisite | ❌ NIEZGODNE |
| Uczenie w kolejnosci prerequisite = lepsze wyniki | ✅ ZGODNE |
| AI redukuje czas recznego tworzenia grafow | ❌ NIEZGODNE |

**Co robi aplikacja dobrze:**
- System unlock WYMUSZA kolejnosc prerequisite — uczen nie moze otworzyc wezla bez opanowania poprzednikow
- `store.ts:unlock()` implementuje to poprawnie — 1 per branch, progression/bridge automatycznie

**Gdzie jest luka:**
- Budowa grafu jest calkowicie reczna (JSON recznie pisany)
- Brak AI assistance w authoring

💡 **REKOMENDACJA:**
- Authoring tool z AI-sugestiami: "Ten wezel powinien miec prerequisite X" (na podstawie tresci)
- Walidator spójnosci: "Wezel Y jest nieosiagalny — brak sciezki od korzenia"

---

### AAAI, 2024 — Globalna optymalizacja relacji prerequisite

| Twierdzenie | Stan w aplikacji |
|-------------|------------------|
| Optymalizacja globalna > klasyfikacja par w izolacji | 🟡 CZESCIOWE |
| Skaluje sie do duzych domen | ❌ NIEZGODNE |

**Co robi aplikacja:** Unlock jest LOKALNY — patrzy tylko na bezposrednich sasiadow opanowanego wezla (`store.ts:unlock()`). Nie analizuje globalnej struktury grafu.

💡 **REKOMENDACJA:**
- Analiza osiagalnosci: "Ile wezlow stanie sie dostepnych po opanowaniu X?" → priorytetyzacja
- Sugestie "Co dalej?" oparte na globalnej strukturze, nie tylko na sasiadach

---

### Nature Scientific Reports, 2025 — Personalizowane sciezki: KG + Deep RL

| Twierdzenie | Stan w aplikacji |
|-------------|------------------|
| Mastery aktualizowane w czasie rzeczywistym | ❌ NIEZGODNE |
| Personalizacja sciezki przez RL | ❌ NIEZGODNE |
| RL > statyczne sekwencje | ❌ NIEZGODNE |

**Co robi aplikacja:** Mastery jest kliknieciem przycisku "Opanowane!" — nie pomiarem. Sciezka jest statyczna. Kazdy uczen przechodzi te same wezly.

**Problem:** To jest NAJSŁABSZY punkt aplikacji vs badania KG. Badanie z Nature mowi o real-time mastery updates na podstawie interakcji, a aplikacja ma self-report.

💡 **REKOMENDACJA (priorytetowa):**
- **Mastery oparty na interakcjach**, nie na self-report:
  - Ile razy uczen wszedl w wezel
  - Ile flashcards odpowiedzial poprawnie
  - Ile czasu spedzil z materialem
  - Decay formula: sila spada z czasem
- **Adaptacja sciezki:**
  - Jesli uczen szybko opanowal branch X → zaproponuj skip do wyzszego tieru
  - Jesli uczen utknał na branchu Y → zaproponuj content z innego branchu jako wsparcie

---

## 3. DISCOVERY-BASED LEARNING

### F1000Research — Discovery learning w klasie cyfrowej

| Twierdzenie | Stan w aplikacji |
|-------------|------------------|
| Discovery learning poprawia wyniki I samodzielnosc | 🟡 CZESCIOWE |
| Lepszy transfer wiedzy do nowych kontekstow | ❌ NIEZGODNE |
| **Scaffolding jest kluczowe** — zbyt swobodne odkrywanie obniza efektywnosc | ✅ ZGODNE |

**Co robi aplikacja dobrze:**
- Scaffolding JEST — system unlock wymusza sciezke, "Co dalej?" kieruje ucznia
- Uczen nie moze wejsc w dowolny wezel — musi przejsc prerequisite path
- To jest "kierowane odkrywanie", nie "swobodne" — zgodne z badaniem

**Gdzie jest luka:**
- Slowo "discovery" jest naduzyzone — uczen nie ODKRYWA, tylko KLIKA. Nie ma momentu "aha!"
- Brak interakcji z pojeciami — uczen czyta definicje, nie eksploruje
- Brak transferu miedzy kontekstami — kazdy wezel jest izolowany

**Problem:** Concept note mowi o "organic spaced repetition embedded in reading" i "aktywnym odkrywaniu pojec". W rzeczywistosci uczen:
1. Klika wezel
2. Czyta opis
3. Klika "Opanowane!"
4. Idzie dalej

To jest PASYWNE, nie discovery-based.

💡 **REKOMENDACJA (krytyczna — dotyczy core value proposition):**
- **Pojecia w tekscie:** Content items powinny zawierac tekst z pojeciami-linkami (termy). Klikniecie w termin = "odkrycie" (hit). Wielokrotne odkrywanie tego samego termu w roznych kontekstach = spaced repetition organiczny.
- **Cross-node connections:** Termin "vanitas" pojawia sie w Biblii, Kohelecie i Baroku — klikniecie w niego w jednym kontekscie podswietla go w innych wezlach. TO jest discovery.
- **Mini-challenges:** Zamiast "Opanowane!" → krotki quiz: "Polacz termin z definicja" lub "Gdzie jeszcze pojawia sie ten motyw?" Dopiero poprawna odpowiedz → mastery.

---

### ResearchGate, 2023 — Guided discovery + active learning w STEM

| Twierdzenie | Stan w aplikacji |
|-------------|------------------|
| Guided discovery > swobodne odkrywanie | ✅ ZGODNE |
| Wyzsze zaangazowanie i glebsze zrozumienie | 🟡 CZESCIOWE |
| Efekt najsilniejszy gdy odkrywanie jest KIEROWANE | ✅ ZGODNE |

**Co robi aplikacja dobrze:**
- Odkrywanie JEST kierowane (prerequisite unlock, "Co dalej?")
- Struktura jest jasna (backbone → branches → bridges)

**Gdzie jest luka:**
- Brak "active learning" — uczen jest pasywny (czyta, klika)
- Brak interakcji z materialem poza jednorazowym przeczytaniem

💡 **REKOMENDACJA:**
- Dodac interaktywne elementy: drag-and-drop (polacz pojecie z definicja), sort (uloz chronologicznie), match (ktore dzielo = ktory motyw)
- Te interakcje = hits do spaced repetition

---

## 4. PODSUMOWANIE ZGODNOSCI

### Tabela zbiorcza

| Obszar badawczy | Zrodel | Zgodnych | Czesciowych | Niezgodnych |
|-----------------|--------|----------|-------------|-------------|
| Spaced Repetition | 4 | 0 | 0 | **4** |
| Knowledge Graphs | 5 | 3 | 3 | **5** |
| Discovery Learning | 2 | 2 | 2 | **1** |
| **RAZEM** | **11** | **5** | **5** | **10** |

> Uwaga: jedno badanie moze miec kilka twierdzen — stad sumy wieksze niz liczba zrodel.

### Ranking luk — od najwazniejszej

| # | Luka | Dotyczy badania | Priorytet |
|---|------|-----------------|-----------|
| 1 | **Brak spaced repetition** — zero powtórek, zero interwalow, zero decay | Kang, Maye, PMC×2 | 🔴 KRYTYCZNY |
| 2 | **Mastery przez self-report** — klikniecie "Opanowane!" zamiast pomiaru | Nature 2025, JEDM | 🔴 KRYTYCZNY |
| 3 | **Brak interakcji z pojeciami** — czytanie bez aktywnosci = pasywne | F1000R, ResearchGate | 🔴 KRYTYCZNY |
| 4 | **Brak logowania interakcji** — timestamps, hits, czas spedzony | PMC 2017, Nature 2025 | 🟡 WYSOKI |
| 5 | **Statyczna sciezka** — brak adaptacji do postepow ucznia | Heliyon, Nature 2025 | 🟡 WYSOKI |
| 6 | **Brak cross-node connections** — pojecia izolowane w wezlach | F1000R (transfer) | 🟡 WYSOKI |
| 7 | **Brak wizualizacji sily pamieci** — uczen nie widzi decay | PMC 2022 | 🟡 SREDNI |
| 8 | **Brak search/QA** | Heliyon | 🟢 NISKI (na razie) |
| 9 | **Reczna budowa grafow** — brak AI assistance | JEDM, AAAI | 🟢 NISKI (authoring tool) |
| 10 | **Brak globalnej optymalizacji sciezki** | AAAI 2024 | 🟢 NISKI (zaawansowane) |

---

## 5. MINIMALNY ZAKRES ZMIAN — aby uczciwie powolac sie na badania

### Wymagane PRZED zlozeniem KA210 (aby nie klamac w aplikacji):

**A. Spaced Repetition (min. viable)**
```
Rozszerzyc nodeStates o:
- hits: number (ile razy uczen wszedl w wezel)
- lastSeen: timestamp
- strength: wyliczana dynamicznie

Formule: strength = min(hits/5, 1) × e^(-0.1 × days)

Wizualizacja: jasnosc wezla w galaxy = strength
Wezly z strength < 0.3 → status wraca do "wymaga powtorki"
```

**B. Discovery — aktywne odkrywanie pojec**
```
Content items z type: 'term' → pojecia-linki w tekscie
Klikniecie w termin = hit (liczony w SR)
Ten sam termin w roznych wezlach → podswietlenie cross-references
```

**C. Mastery oparte na interakcji (nie self-report)**
```
Zamiast przycisku "Opanowane!":
- Wezel przechodzi w "in_progress" po pierwszym otwarciu
- Mastery = automatyczne gdy:
  a) uczen odkryl 80%+ terminow w wezle
  b) odpowiedzial na 60%+ pytan/flashcards
  c) wrócil do wezla po 24h+ (spaced repetition)
```

**D. Logowanie interakcji**
```
Kazda interakcja z wezlem/terminem/flashcard → log:
{ nodeId, action, timestamp, result? }

Przechowywanie: IndexedDB (offline-first, jak reszta)
Eksport: JSON do ewaluacji
```

---

## 6. BRAKUJACE ZRODLA — co warto dodac do badania

Obecna baza (11 zrodel) ma luki. Aby concept note byl wiarygodny, warto dodac badania o:

| Temat | Dlaczego brakuje | Przykladowe zrodla do znalezienia |
|-------|------------------|----------------------------------|
| **Gamification in education** | System monet nie ma pokrycia badawczego | Deterding 2011, Hamari et al. 2014 |
| **3D visualization in learning** | Galaxy view nie ma zrodla — concept mapping tak, ale 3D nie | Dalgarno & Lee 2010, Mikropoulos & Natsis 2011 |
| **Offline-first / low-connectivity education** | Kluczowy argument inkluzji — zero zrodel | UNESCO reports, World Bank EdTech |
| **RAG / grounding in education** | AI section concept note nie ma zrodel | Lewis et al. 2020 (RAG original), Guu et al. 2020 |
| **Open educational resources (OER)** | Argument open-source — brak zrodel | UNESCO OER Recommendation 2019, Hilton 2016 |
| **Local/sovereign AI** | Argument RODO/Bielik — brak zrodel | EU AI Act, GDPR case law |

---

## 7. CO MOWIMY W APLIKACJI vs CO POWINIEN ROBIC KOD

| Twierdzenie w concept note | Czy kod to robi? | Status |
|----------------------------|-------------------|--------|
| "Discovery-based learning" | Uczen klika i czyta — to nie discovery | ❌ Do przerobienia |
| "Organic spaced repetition embedded in reading" | Zero SR, zero embeddingu w czytaniu | ❌ Do zbudowania |
| `strength = min(hits/5, 1) × e^(-0.1 × days)` | Formula istnieje w dokumencie, nie w kodzie | ❌ Do implementacji |
| "3D knowledge map" | Tak, galaxy view dziala | ✅ OK |
| "Offline-first" | Tak, IndexedDB cache | ✅ OK |
| "Plugin architecture (Moodle-style)" | Tylko w ep-BRAIN-QUEST, nie tutaj | 🟡 Inna aplikacja |
| "Knowledge graph" | Tak, SkillTreeDef z nodes/edges/branches | ✅ OK |
| "Prerequisite-based progression" | Tak, unlock system dziala | ✅ OK |
| "Content packs" | Tak, ContentPack z 4 typami items | ✅ OK |
| "Wizualizacja struktury" | Tak, galaxy + minimapa | ✅ OK |
| "Personalizacja sciezki" | Nie — sciezka jest statyczna | ❌ Do dodania |
| "AI feedback" | Nie — zero AI | ❌ RAG API |

---

## WNIOSKI

**Aplikacja jest silna w:** wizualizacji KG, prerequisite-based progression, scaffolding, offline-first, modularnych content packs.

**Aplikacja jest slaba w:** spaced repetition (zero), discovery learning (pasywne), mastery measurement (self-report), personalizacja (statyczna), AI (zero).

**Przed powolaniem sie na badania trzeba:**
1. Zaimplementowac SR (hits, timestamps, decay, powtorki)
2. Zmienic discovery z "czytaj i klikaj" na "odkrywaj pojecia w tekscie"
3. Zastapic self-report mastery pomiarem interakcji
4. Logowac interakcje (do ewaluacji i do adaptacji)

Bez tych zmian powolywanie sie na Kanga, Maye, F1000Research i Nature jest **niezgodne z rzeczywistoscia aplikacji**.
