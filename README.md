# 🍸 Thirsty

Recherche de cocktails en langage naturel (voix ou clavier) avec préparation
détaillée. Recherche **sémantique 100 % locale** — aucune API payante, aucune clé.

## Comment ça marche

1. **Ingestion** (`scripts/ingest.ts`) : récupère les ~426 cocktails de
   [TheCocktailDB](https://www.thecocktaildb.com), les normalise, **traduit en
   français** les champs uniquement anglais (noms d'ingrédients + instructions
   sans version FR native) avec `Xenova/opus-mt-en-fr`, puis génère un
   embedding **bilingue** par cocktail avec `Xenova/multilingual-e5-small`
   (via [transformers.js](https://github.com/huggingface/transformers.js)).
   Le résultat est écrit dans `data/cocktails.json` + `data/embeddings.json`.
2. **Recherche** (`src/lib/search.ts` + `src/app/api/search/route.ts`) : la
   requête est vectorisée à la volée puis comparée par similarité cosinus aux
   vecteurs chargés en mémoire (brute-force, instantané à cette échelle). Comme
   l'index contient le texte EN **et** FR, une recherche matche dans les deux
   langues quelle que soit la langue d'affichage.
3. **UI** (`src/app/page.tsx`) : barre de recherche épurée, bouton micro à
   gauche (**Web Speech API**, Chrome/Edge), chips de filtre alcool, et un
   **sélecteur de langue FR/EN** (mémorisé) qui traduit interface et résultats.

## Démarrer

```bash
npm install
npm run ingest   # une fois — télécharge le modèle (~100 Mo) puis indexe
npm run dev      # http://localhost:3000
```

## Notes

- La recherche vocale repose sur la Web Speech API : disponible sur les
  navigateurs Chromium (Chrome, Edge), le bouton est masqué ailleurs. Sa langue
  suit le sélecteur FR/EN.
- Les traductions FR des ingrédients/instructions sont produites par machine
  (opus-mt) à l'ingestion : qualité correcte mais imparfaite sur certains noms
  de marques. Les instructions FR natives de TheCocktailDB sont préférées
  quand elles existent.
- Les modèles d'embedding gèrent mal la **négation** : « sans alcool » n'exclut
  pas forcément les cocktails alcoolisés. Un filtre explicite alcoolisé /
  sans alcool peut être ajouté par-dessus la recherche sémantique.
- Pour une base beaucoup plus grande, remplacer le scan en mémoire par
  SQLite + `sqlite-vec` ou LanceDB (toujours local/gratuit) sans toucher au reste.
