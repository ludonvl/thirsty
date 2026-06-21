"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

// The Web Speech API isn't in TypeScript's DOM lib, so we declare the slice
// we use. It's gratis, native, and needs no backend — but it's only shipped
// by Chromium-based browsers, hence the `supported` flag below.
interface SpeechRecognitionResult {
  0: { transcript: string };
}
interface SpeechRecognitionEvent extends Event {
  results: ArrayLike<SpeechRecognitionResult>;
}
interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start(): void;
  stop(): void;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

// Capability detection that survives SSR: `false` on the server, the real
// value on the client, with no hydration mismatch.
const emptySubscribe = () => () => {};

export function useSpeechRecognition(
  onTranscript: (text: string) => void,
  locale: string,
) {
  const supported = useSyncExternalStore(
    emptySubscribe,
    () => getCtor() !== null,
    () => false,
  );
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const callbackRef = useRef(onTranscript);

  // Keep the latest callback without re-creating the recognition instance.
  useEffect(() => {
    callbackRef.current = onTranscript;
  });

  useEffect(() => {
    const Ctor = getCtor();
    if (!Ctor) return;

    const recognition = new Ctor();
    recognition.lang = locale;
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onresult = (e) => {
      const transcript = e.results[0]?.[0]?.transcript ?? "";
      if (transcript) callbackRef.current(transcript);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;

    return () => recognition.stop();
  }, [locale]);

  const toggle = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    if (listening) {
      recognition.stop();
      setListening(false);
    } else {
      recognition.start();
      setListening(true);
    }
  }, [listening]);

  return { supported, listening, toggle };
}
