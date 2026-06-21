export type Lang = "fr" | "en";

export const LANGS: Lang[] = ["fr", "en"];

/** Interface strings per language. */
export const UI: Record<Lang, {
  tagline: string;
  placeholder: string;
  filters: { all: string; alcoholic: string; nonAlcoholic: string };
  empty: string;
  listen: string;
  stopListening: string;
  listeningHint: string;
  transcribing: string;
  micError: {
    notAllowed: string;
    unavailable: string;
    noSpeech: string;
    generic: string;
  };
}> = {
  fr: {
    tagline: "Dites ou tapez l’envie du moment, on vous montre comment le préparer.",
    placeholder: "Un mojito, un truc fruité sans alcool…",
    filters: { all: "Tous", alcoholic: "Alcoolisé", nonAlcoholic: "Sans alcool" },
    empty: "Aucun cocktail trouvé. Essayez une autre formulation.",
    listen: "Recherche vocale",
    stopListening: "Arrêter l’écoute",
    listeningHint: "À l’écoute… parlez, je m’arrête tout seul.",
    transcribing: "Transcription…",
    micError: {
      notAllowed:
        "Accès au micro refusé. Autorisez le microphone pour ce site dans les réglages du navigateur.",
      unavailable:
        "La reconnaissance vocale n’est pas disponible dans ce navigateur. Essayez Chrome.",
      noSpeech: "Aucune voix détectée. Réessayez.",
      generic: "La recherche vocale a échoué. Réessayez ou tapez votre recherche.",
    },
  },
  en: {
    tagline: "Say or type what you’re craving — we’ll show you how to make it.",
    placeholder: "A mojito, something fruity and alcohol-free…",
    filters: { all: "All", alcoholic: "Alcoholic", nonAlcoholic: "Alcohol-free" },
    empty: "No cocktail found. Try rephrasing.",
    listen: "Voice search",
    stopListening: "Stop listening",
    listeningHint: "Listening… speak, it stops automatically.",
    transcribing: "Transcribing…",
    micError: {
      notAllowed:
        "Microphone access denied. Allow the microphone for this site in your browser settings.",
      unavailable:
        "Voice recognition isn’t available in this browser. Try Chrome.",
      noSpeech: "No speech detected. Try again.",
      generic: "Voice search failed. Try again or type your search.",
    },
  },
};

/** Map a Web Speech API error code to a human message. */
export function tMicError(code: string, lang: Lang): string {
  const m = UI[lang].micError;
  switch (code) {
    case "not-allowed":
      return m.notAllowed;
    case "unavailable":
    case "service-not-allowed":
    case "network":
      return m.unavailable;
    case "no-speech":
      return m.noSpeech;
    default:
      return m.generic;
  }
}

/** BCP-47 locale for the Web Speech API, per UI language. */
export const SPEECH_LOCALE: Record<Lang, string> = {
  fr: "fr-FR",
  en: "en-US",
};

// Source enums from TheCocktailDB are English. These maps give clean,
// human-checked French labels rather than relying on machine translation.
const CATEGORY_FR: Record<string, string> = {
  Cocktail: "Cocktail",
  "Ordinary Drink": "Boisson classique",
  "Punch / Party Drink": "Punch / Boisson de fête",
  Shake: "Milk-shake",
  "Other / Unknown": "Autre / Inconnu",
  Cocoa: "Cacao",
  Shot: "Shot",
  "Coffee / Tea": "Café / Thé",
  "Homemade Liqueur": "Liqueur maison",
  Beer: "Bière",
  "Soft Drink": "Boisson sans alcool",
};

const ALCOHOLIC_FR: Record<string, string> = {
  Alcoholic: "Alcoolisé",
  "Non alcoholic": "Sans alcool",
  "Optional alcohol": "Alcool optionnel",
};

export function tCategory(value: string | null, lang: Lang): string | null {
  if (!value) return value;
  return lang === "fr" ? (CATEGORY_FR[value] ?? value) : value;
}

export function tAlcoholic(value: string | null, lang: Lang): string | null {
  if (!value) return value;
  return lang === "fr" ? (ALCOHOLIC_FR[value] ?? value) : value;
}
