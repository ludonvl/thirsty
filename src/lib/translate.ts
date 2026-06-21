import { pipeline, type TranslationPipeline } from "@huggingface/transformers";

// Local, free English→French translation. Used only at ingestion time to fill
// in what TheCocktailDB provides solely in English (ingredient names, and any
// instructions without a native French translation).
const MODEL_ID = "Xenova/opus-mt-en-fr";

let translatorPromise: Promise<TranslationPipeline> | null = null;

function getTranslator(): Promise<TranslationPipeline> {
  if (!translatorPromise) {
    translatorPromise = pipeline("translation", MODEL_ID);
  }
  return translatorPromise;
}

// Many ingredient names repeat across cocktails — translate each string once.
const cache = new Map<string, string>();

export async function translateEnToFr(text: string): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed) return "";

  const cached = cache.get(trimmed);
  if (cached !== undefined) return cached;

  const translator = await getTranslator();
  const out = (await translator(trimmed)) as Array<{ translation_text?: string }>;
  const result = out[0]?.translation_text?.trim() || trimmed;

  cache.set(trimmed, result);
  return result;
}
