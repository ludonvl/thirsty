/** A piece of text available in both supported languages. */
export interface LocalizedText {
  en: string;
  fr: string;
}

export interface Ingredient {
  /** Quantity as provided by the source, e.g. "4 cl" — language-neutral. */
  measure: string | null;
  /** Ingredient name in each language. */
  name: LocalizedText;
}

export interface Cocktail {
  id: string;
  name: string;
  /** Source category, kept in English; translated for display via i18n maps. */
  category: string | null;
  glass: string | null;
  /** Source alcohol flag in English ("Alcoholic" / "Non alcoholic" / …). */
  alcoholic: string | null;
  image: string | null;
  ingredients: Ingredient[];
  /** Preparation steps in both languages. */
  instructions: LocalizedText;
}

/** A cocktail enriched with its similarity score for a given query. */
export interface CocktailMatch extends Cocktail {
  score: number;
}

/** Explicit alcohol preference. `null` means no filtering. */
export type AlcoholFilter = "alcoholic" | "non-alcoholic" | null;
