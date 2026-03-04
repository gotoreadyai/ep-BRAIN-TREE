# ROADMAP — OpenDiscovery (Erasmus+ POL-EXP)

> Co aplikacja KNOWLEDGE-NEST potrzebuje, aby spełnić wymagania projektu Erasmus+ T01-DIGITAL-CONTENT.

---

## LEGENDA

- ✅ JEST — dziala, gotowe
- 🟡 CZESCIOWO — zaczete, wymaga rozbudowy
- ❌ BRAK — do zbudowania od zera

---

## 1. STAN OBECNY vs WYMAGANIA

### A. Silnik wizualizacji (WP2)

| Funkcja | Stan | Uwagi |
|---------|------|-------|
| 3D galaxy view (knowledge graph) | ✅ | react-three-fiber, spiral layout, fly-to |
| Rendering wezlow (backbone/branch/bridge) | ✅ | Rozmiary, ksztalty, opacity wg odleglosci |
| Krawedzie (progression/branch/bridge) | ✅ | Bezier curves, typy krawedzi |
| Selekcja wezla + panel info | ✅ | NodePanel z opisem, polaczeniami |
| Katalog paczek z GitHub | ✅ | API org gniazdo-wiedzy, topice |
| IndexedDB cache (offline-first) | ✅ | cache.ts, fallback na siec |
| Ladowanie rozszerzen (TreePack) | ✅ | Merge nodes/edges, deduplikacja |
| Ladowanie tresci (ContentPack) | ✅ | Content items per node |
| System postepow (locked → available → in_progress → mastered) | ✅ | localStorage, odblokowywanie sasiadow |
| System monet (coins) | 🟡 | Zaczety — zarabianie za progres, wydawanie na content |
| Widok profilu z minimapa | ✅ | UserPanel, statystyki, layout materialowy |

### B. Format danych — knowledge.json v2 (WP2)

| Funkcja | Stan | Uwagi |
|---------|------|-------|
| Bazowy schemat tree.json | 🟡 | Dziala, ale nieformalny — brak specyfikacji |
| JSON Schema / walidator | ❌ | Brak walidacji przy ladowaniu |
| Metadane wielojezyczne (i18n) | ❌ | Brak — tytuly/opisy tylko po polsku |
| Difficulty levels per node | ❌ | Brak pola difficulty |
| Discovery metadata (spaced repetition) | ❌ | Brak algorytmu SR w danych |
| Relacje cross-content (miedzy paczkami) | ❌ | Brak linkowania miedzy bazami |
| Wersjonowanie standardu | ❌ | Brak version field |
| Dokumentacja standardu (spec publiczna) | ❌ | Tylko CLAUDE.md wewnetrznie |

### C. Wielojezycznosc (WP2/WP3)

| Funkcja | Stan | Uwagi |
|---------|------|-------|
| i18n frameworka (UI) | ❌ | Caly UI po polsku, hardcoded stringi |
| Wielojezyczne content packs | ❌ | 4 paczki, wszystkie po polsku |
| Locale switching | ❌ | Brak |
| RTL support | ❌ | Niewymagane na poczatku, ale dobrze miec |

### D. Narzedzia autorskie — Authoring Tool (WP2)

| Funkcja | Stan | Uwagi |
|---------|------|-------|
| Web-based edytor knowledge.json | ❌ | Nie istnieje — krytyczny deliverable |
| WYSIWYG tree builder (drag & drop) | ❌ | |
| Content pack editor | ❌ | |
| Preview wizualizacji | ❌ | |
| Eksport do GitHub repo | ❌ | |
| Walidacja w edytorze | ❌ | |

### E. AI / RAG (WP2)

| Funkcja | Stan | Uwagi |
|---------|------|-------|
| RAG API server | ❌ | Zero backendu — wymaga decyzji architekturalnej |
| Integracja z Bielik (PL) | ❌ | |
| Lokalne LLM per kraj | ❌ | |
| Vector DB na content packs | ❌ | |
| AI feedback dla ucznia | ❌ | |
| Grounding w zrodlach (anti-halucynacje) | ❌ | |

### F. Teacher Dashboard (WP3/WP4)

| Funkcja | Stan | Uwagi |
|---------|------|-------|
| Widok klasy (lista uczniow) | ❌ | Brak konceptu uzytkownikow |
| Analytics postepu klasy | ❌ | |
| Eksport danych (CSV/JSON) | ❌ | |
| Przypisywanie zadan | ❌ | |

### G. Warstwa ucznia — Layer 3 (WP3)

| Funkcja | Stan | Uwagi |
|---------|------|-------|
| Node states (locked/available/in_progress/mastered) | ✅ | |
| Coins economy | 🟡 | Zarabianie + wydawanie, ale brak balansu |
| Spaced repetition algorithm | ❌ | Wzor w concept note: `strength = min(hits/5,1) * e^(-0.1*days)` |
| Discovery tracking (hits, timestamps) | ❌ | Brak logowania interakcji z pojęciami |
| Streak / sesje | ❌ | |
| Mastery thresholds (configurable) | ❌ | Teraz binarne: mastered/nie |
| Dane anonimizowane do ewaluacji | ❌ | |

### H. Dostepnosc i jakosc (WP2)

| Funkcja | Stan | Uwagi |
|---------|------|-------|
| WCAG 2.1 AA | ❌ | 3D canvas nie ma aria, keyboard nav slaby |
| Performance (lazy loading) | 🟡 | Vite code-split, ale 3D laduje wszystko |
| Error boundaries | ❌ | Crash Three.js = bialy ekran |
| Schema validation przy load | ❌ | |
| Testy (unit/integration) | ❌ | Zero testow |

### I. Infrastruktura projektu

| Funkcja | Stan | Uwagi |
|---------|------|-------|
| Plugin SDK v2 | ❌ | ep-BRAIN-QUEST ma SDK, ten projekt nie |
| CI/CD (build + deploy) | ❌ | Tylko lokalne dev |
| Hosting produkcyjny | ❌ | |
| Dokumentacja techniczna (publiczna) | ❌ | Tylko CLAUDE.md |
| Licencja MIT | ❌ | Brak pliku LICENSE |

---

## 2. PRIORYTETY — CO KIEDY BUDOWAC

### FAZA 0: Pre-grant / KA210 (teraz → paź 2026)
> Cel: Dzialajacy prototyp do pokazania partnerom i w aplikacji KA210

| # | Zadanie | Effort | Deliverable |
|---|---------|--------|-------------|
| 0.1 | **Formalizacja knowledge.json v1** — JSON Schema, README, przykladowe paczki | S | Spec + validator |
| 0.2 | **i18n UI** — react-i18next, ekstrakcja stringow, EN + PL | M | Przeloczona aplikacja |
| 0.3 | **1 content pack w EN** — antyk lub biblia po angielsku | S | Demonstracja wielojezycznosci |
| 0.4 | **Spaced repetition (basic)** — logowanie hits/timestamps, decay formula | M | Discovery tracking |
| 0.5 | **WCAG basic** — keyboard nav, aria-labels, contrast | M | Dostepnosc bazowa |
| 0.6 | **Error boundaries + validation** | S | Stabilnosc |
| 0.7 | **LICENSE (MIT) + publiczny README** | XS | GitHub-ready |
| 0.8 | **Deploy na Vercel/Netlify** — publiczny URL | XS | Demo link |
| 0.9 | **1-pager video demo** | S | Material dla partnerow |

### FAZA 1: KA210 (60k EUR, ~12 mies.)
> Cel: Pilotaz z 1 szkola zagraniczna, track record

| # | Zadanie | Effort | Deliverable |
|---|---------|--------|-------------|
| 1.1 | **Authoring tool v1** — prosty web editor: dodaj node, edge, content item, eksport JSON | L | D2.2 (beta) |
| 1.2 | **Content packs x10** — 5 PL + 5 EN (literatura + historia) | L | Baza tresci |
| 1.3 | **Teacher view (basic)** — readonly podglad postepu ucznia (local, bez serwera) | M | Dashboard v0 |
| 1.4 | **knowledge.json v1.5** — difficulty, language field, version | M | Standard update |
| 1.5 | **Pilotaz 1 klasa PL + 1 zagraniczna** | — | Track record |
| 1.6 | **Zbieranie danych (logi + ankiety)** — eksport z localStorage/IDB | M | Dataset v0 |
| 1.7 | **Publikacja** — blog post / short paper o discovery learning z KG | S | Credibility |

### FAZA 2: KA220 (250k EUR, ~24 mies.)
> Cel: 3 kraje, dev + ewaluacja, publikacje

| # | Zadanie | Effort | Deliverable |
|---|---------|--------|-------------|
| 2.1 | **knowledge.json v2 — pelna specyfikacja** z metadanymi i18n, cross-content, discovery metadata | L | D2.1 |
| 2.2 | **Authoring tool v2** — WYSIWYG, preview 3D, walidacja, GitHub push | XL | D2.5 |
| 2.3 | **RAG API (Bielik)** — serwer z vector DB, grounding w content packs | XL | D2.3 |
| 2.4 | **Plugin SDK** — dokumentacja, CLI, template repo | L | D2.4 |
| 2.5 | **3 jezyki UI** — PL + EN + CZ/SK | M | i18n |
| 2.6 | **Content packs x30** — w 3 jezykach | XL | Skala |
| 2.7 | **Teacher dashboard** — widok klasy, analytics, eksport CSV | L | WP3 |
| 2.8 | **Quasi-eksperyment** — design badawczy, 3+ szkoly, pre/post testy | — | WP5 |
| 2.9 | **2 publikacje naukowe** — discovery learning + local AI | — | Credibility |
| 2.10 | **WCAG 2.1 AA full** — audit + fixes | L | Compliance |

### FAZA 3: POL-EXP (do 1M EUR, 36 mies.)
> Cel: 5+ krajow, 20+ szkol, 2000+ uczniow, policy impact

| # | Zadanie | Effort | Deliverable |
|---|---------|--------|-------------|
| 3.1 | **5+ jezykow UI + content** | XL | D2.3 |
| 3.2 | **50+ content packs** | XL | D3.1 |
| 3.3 | **Lokalne LLM per kraj** (nie tylko Bielik) | XL | Multi-country AI |
| 3.4 | **MOOC** — 6 modulow, 20h, video + quizy | XL | D4.1 |
| 3.5 | **DEC Decision Framework** — narzedzie dla dyrektorow | L | D3.4 |
| 3.6 | **Data pipeline** — anonimizacja, Zenodo export | L | D5.7 |
| 3.7 | **Policy briefs** x2 | — | D5.3, D5.4 |
| 3.8 | **Multiplier Events** x3 | — | WP5 |
| 3.9 | **Sustainability plan** — freemium, community, follow-up grants | — | D5.6 |

---

## 3. ARCHITEKTURA DOCELOWA

```
TERAZ (client-only)              DOCELOWO (Erasmus+)
========================         ========================

GitHub (CMS)                     GitHub (CMS)
    |                                |
 tree.json                      knowledge.json v2
    |                                |
 React SPA ◄── IndexedDB        React SPA ◄── IndexedDB
    |                                |
 3D Galaxy                       3D Galaxy + Authoring Tool
                                     |
                              ┌──────┴──────┐
                              │  RAG API     │  ← NOWE (serwer)
                              │  Bielik/LLM  │
                              │  Vector DB   │
                              └──────────────┘
                                     |
                              ┌──────┴──────┐
                              │  Teacher     │  ← NOWE
                              │  Dashboard   │
                              │  Analytics   │
                              └──────────────┘
                                     |
                              ┌──────┴──────┐
                              │  Data Export │  ← NOWE
                              │  Anonymizer  │
                              │  Zenodo      │
                              └──────────────┘
```

**Kluczowa decyzja architekturalna:** RAG API lamie zasade "zero backendu". Opcje:
1. **Serwer centralny** (SmartHigh hostuje) — prostsze, ale vendor lock
2. **Self-hosted per szkola** (Docker/Ollama) — trudniejsze, ale suwerenne
3. **Hybrydowe** — client-only do nauki, serwer opcjonalny do AI features

---

## 4. RYZYKO TECHNICZNE

| Ryzyko | Prawdop. | Wplyw | Mitygacja |
|--------|----------|-------|-----------|
| 3D canvas nie spelni WCAG AA | Wysokie | Srednie | Alternatywny widok 2D (przywrocic metro?) |
| RAG API = nowy stos technologiczny | Srednie | Wysokie | Zaczac od prostego Ollama + LangChain |
| Authoring tool to osobna duza aplikacja | Wysokie | Wysokie | MVP: formularz JSON, nie WYSIWYG |
| 50 content packs wymaga procesu editorial | Srednie | Srednie | Szablony + walidator + peer review flow |
| Bielik niedostepny w produkcji | Niskie | Srednie | Fallback: Mistral/Llama + RAG |
| localStorage nie skaluje sie do analytics | Wysokie | Srednie | Przejsc na IDB + opcjonalny sync endpoint |

---

## 5. METRYKI GOTOWOSCI

| Milestone | Kiedy | Warunek zaliczenia |
|-----------|-------|---------------------|
| **Demo-ready** | Teraz + 2 mies. | Publiczny URL, EN UI, 1 pack EN, LICENSE MIT |
| **KA210-ready** | Teraz + 4 mies. | Spec v1, authoring v0, 10 packs, 1 pilotaz |
| **KA220-ready** | KA210 + 12 mies. | Spec v2, authoring v2, RAG, 30 packs, 3 kraje |
| **POL-EXP-ready** | KA220 + 18 mies. | 50+ packs, 5+ jezykow, MOOC, DEC framework |

---

## 6. CO ZROBIC JUTRO (quick wins)

1. Dodac `LICENSE` (MIT)
2. Dodac `version: "1.0"` do tree.json
3. Napisac JSON Schema dla SkillTreeDef / ContentPack
4. Zainstalowac react-i18next, wyciagnac stringi z UI
5. Zdeployowac na Vercel (publiczny link do demo)
6. Przetlumaczyc 1 content pack na EN

To wystarczy, zeby miec **material do rozmow z potencjalnymi partnerami** na KA210.
