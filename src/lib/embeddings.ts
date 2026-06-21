import { pipeline, type FeatureExtractionPipeline } from "@huggingface/transformers";

// Small, fast, genuinely multilingual model (384 dims). Runs 100% locally
// via transformers.js — no API calls, no keys.
const MODEL_ID = "Xenova/multilingual-e5-small";

let extractorPromise: Promise<FeatureExtractionPipeline> | null = null;

function getExtractor(): Promise<FeatureExtractionPipeline> {
  if (!extractorPromise) {
    extractorPromise = pipeline("feature-extraction", MODEL_ID);
  }
  return extractorPromise;
}

/** Embed a single text into a normalized vector. */
export async function embed(text: string): Promise<number[]> {
  const extractor = await getExtractor();
  const output = await extractor(text, { pooling: "mean", normalize: true });
  return Array.from(output.data as Float32Array);
}

// e5 models expect these prefixes to distinguish search queries from
// indexed documents — it measurably improves retrieval quality.
export const asQuery = (text: string): string => `query: ${text}`;
export const asPassage = (text: string): string => `passage: ${text}`;
