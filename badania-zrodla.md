# Źródła naukowe — BrainQuest

## Spaced Repetition

1. **Kang, 2016** — Spaced Repetition Promotes Efficient and Effective Learning: Policy Implications for Instruction
   https://journals.sagepub.com/doi/abs/10.1177/2372732215624708
   Rozłożone powtórki w czasie są skuteczniejsze niż masowe uczenie się. Autor rekomenduje wdrożenie SR jako standardu w programach nauczania. Efekt jest stabilny niezależnie od typu materiału.

2. **Maye et al., 2026** — The Effectiveness of Spaced Repetition in Medical Education: Systematic Review and Meta-Analysis (14 badań, 21 415 uczestników)
   https://asmepublications.onlinelibrary.wiley.com/doi/10.1111/tct.70353
   Meta-analiza potwierdza skuteczność SR w zapamiętywaniu wiedzy faktycznej w edukacji medycznej. Efekt jest istotny statystycznie na dużej próbie (21k uczestników). SR sprawdza się szczególnie przy materiałach wymagających długoterminowej retencji.

3. **PMC, 2017** — Spacing Repetitions Over Long Timescales: A Review and a Reconsolidation Explanation
   https://pmc.ncbi.nlm.nih.gov/articles/PMC5476736/
   Przegląd łączy efekt spacingu z mechanizmem rekonsolidacji pamięci w neurobiologii. Optymalne interwały powtórek rosną wraz z czasem — krótsze na początku, dłuższe później. Daje to podstawę do projektowania algorytmów adaptacyjnych.

4. **PMC, 2022** — Evidence of the Spacing Effect and Influences on Perceptions of Learning and Science Curricula
   https://pmc.ncbi.nlm.nih.gov/articles/PMC8759977/
   Efekt spacingu potwierdzony eksperymentalnie w naukach ścisłych. Uczniowie subiektywnie nie czują że SR działa lepiej, mimo obiektywnie lepszych wyników. Wskazuje na potrzebę budowania zaufania do metody w UI aplikacji.

## Knowledge Graphs w edukacji

Przegląd Heliyon (120 prac, 2019–2023) identyfikuje 5 głównych zastosowań KG w edukacji:
1. **Adaptive & Personalised Learning** — dopasowanie ścieżki do postępów ucznia
2. **Curriculum Design** — strukturyzacja programu nauczania wokół relacji między pojęciami
3. **Concept Mapping & Visualization** — wizualna mapa połączeń w domenie wiedzy
4. **Semantic Search & QA** — inteligentne wyszukiwanie i odpowiadanie na pytania
5. **Prerequisite Detection** — automatyczne wykrywanie co trzeba umieć zanim nauczysz się X

Skale istniejących KG: od kilkuset pojęć (kurs) do 60k encji / 80k relacji (program) do 2.5M encji (platforma).

Główne wyzwania: brak standaryzacji ontologii, słaba interoperacyjność między systemami, trudność automatycznej ekstrakcji relacji z materiałów tekstowych.

5. **Heliyon, 2024** — A Systematic Literature Review of Knowledge Graph Construction and Application in Education (120 prac, 2019–2023)
   https://pmc.ncbi.nlm.nih.gov/articles/PMC10847940/
   KG w edukacji służą do modelowania relacji między pojęciami, personalizacji ścieżek i rekomendacji treści. Najskuteczniejsze metody konstrukcji łączą NLP (BERT-BiLSTM-CRF) z ontologiami domenowymi. Kluczowy kierunek: integracja LLM z grafami wiedzy dla automatycznej budowy i aktualizacji KG.

6. **Electronics (MDPI), 2024** — A Survey of Knowledge Graph Approaches and Applications in Education
   https://www.mdpi.com/2079-9292/13/13/2537
   Główne zastosowania KG: wykrywanie relacji prerequisite, adaptacyjne uczenie, ocena wiedzy ucznia. Grafy wiedzy pozwalają systemom edukacyjnym rozumieć strukturę domeny, nie tylko pojedyncze fakty. Najskuteczniejsze podejścia łączą KG z technikami NLP.

7. **JEDM** — ACE: AI-Assisted Construction of Educational Knowledge Graphs with Prerequisite Relations
   https://jedm.educationaldatamining.org/index.php/JEDM/article/view/737
   AI potrafi automatycznie budować grafy wiedzy z relacjami prerequisite. Studenci uczący się w kolejności wyznaczonej przez relacje prerequisite osiągają lepsze wyniki. Metoda znacząco redukuje czas ręcznego tworzenia grafów edukacyjnych.

8. **AAAI, 2024** — Learning Concept Prerequisite Relation via Global Knowledge Relation Optimization
   https://ojs.aaai.org/index.php/AAAI/article/view/32156
   Nowa metoda wykrywania relacji prerequisite uwzględnia globalną strukturę grafu, nie tylko pary pojęć. Optymalizacja globalna daje dokładniejsze wyniki niż klasyfikacja par w izolacji. Podejście skaluje się do dużych domen edukacyjnych.

9. **Nature Scientific Reports, 2025** — Personalized Learning Path Recommendation Based on Knowledge Graph and Deep Reinforcement Learning
   https://www.nature.com/articles/s41598-025-17918-x
   System rekomendacji ścieżek nauki łączy KG (relacje prerequisite + semantyczne) z deep reinforcement learning. Mastery ucznia aktualizowane w czasie rzeczywistym na podstawie interakcji. Personalizacja ścieżki przez RL daje lepsze wyniki niż statyczne sekwencje.

## Discovery-Based Learning

10. **F1000Research** — Implementation of Discovery Learning in a Digital Class and Its Effect on Student Learning Outcomes and Learning Independence Level
    https://f1000research.com/articles/10-386
    Discovery learning w klasie cyfrowej poprawia zarówno wyniki nauki, jak i samodzielność uczenia się. Uczniowie uczący się przez odkrywanie lepiej radzą sobie z transferem wiedzy do nowych kontekstów. Kluczowe jest odpowiednie scaffoldowanie — zbyt swobodne odkrywanie obniża efektywność.

11. **ResearchGate, 2023** — Discovery-Based Approach Combined with Active Learning to Improve Student Learning Experiences for STEM Students
    https://www.researchgate.net/publication/373009516
    Połączenie discovery z active learning daje lepszą retencję niż tradycyjny wykład w STEM. Studenci wykazują wyższe zaangażowanie i głębsze zrozumienie materiału. Efekt jest najsilniejszy gdy odkrywanie jest kierowane, a nie całkowicie swobodne.

## Przykładowe użycie w formularzu

> Projekt bazuje na otwartych modelach Bielik (SpeakLeash Foundation / AGH Kraków) oraz badaniach nad spaced repetition (Kang 2016, Maye et al. 2026) i knowledge graphs w edukacji (Heliyon 2024, JEDM).
