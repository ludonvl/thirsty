import {
  pipeline,
  type AutomaticSpeechRecognitionPipeline,
} from "@huggingface/transformers";
import type { Lang } from "@/lib/i18n";

// Local, free, multilingual speech-to-text via transformers.js — no API, no
// keys, nothing sent to a third party. This is the fallback that makes voice
// search work in browsers whose Web Speech API has no backend (Arc, Brave…).
// whisper-small is the sweet spot for French diction and proper nouns; drop to
// "Xenova/whisper-base" for speed, or go to "Xenova/whisper-medium" for accuracy.
const MODEL_ID = "Xenova/whisper-small";

// Whisper expects 16 kHz mono audio — the client resamples before uploading.
export const SAMPLE_RATE = 16000;

let asrPromise: Promise<AutomaticSpeechRecognitionPipeline> | null = null;

function getAsr(): Promise<AutomaticSpeechRecognitionPipeline> {
  if (!asrPromise) {
    asrPromise = pipeline("automatic-speech-recognition", MODEL_ID);
  }
  return asrPromise;
}

// Multilingual Whisper takes the full language name, not the BCP-47 code.
const WHISPER_LANG: Record<Lang, string> = {
  fr: "french",
  en: "english",
};

/** Transcribe 16 kHz mono PCM samples into text. */
export async function transcribe(
  samples: Float32Array,
  lang: Lang,
): Promise<string> {
  const asr = await getAsr();
  const out = await asr(samples, {
    language: WHISPER_LANG[lang],
    task: "transcribe",
  });
  const text = Array.isArray(out) ? out[0]?.text : out?.text;
  return (text ?? "").trim();
}
