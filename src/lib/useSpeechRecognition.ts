"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { SAMPLE_RATE } from "@/lib/transcribe";

// The Web Speech API isn't in TypeScript's DOM lib, so we declare the slice
// we use. It's gratis, native, and needs no backend — but Chromium ships it
// wired to Google's servers via a built-in key. Forks like Arc/Brave strip
// that key, so the API exists yet errors with "network"/"service-not-allowed".
// When that happens we fall back to recording + local Whisper transcription.
interface SpeechRecognitionResult {
  0: { transcript: string };
}
interface SpeechRecognitionEvent extends Event {
  results: ArrayLike<SpeechRecognitionResult>;
}
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}
interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start(): void;
  stop(): void;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: ((e: SpeechRecognitionErrorEvent) => void) | null;
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

// The Whisper fallback needs mic capture, which requires a secure context.
function canRecord(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.isSecureContext &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof window.MediaRecorder !== "undefined"
  );
}

// Decode a recording (webm/opus, mp4/aac…) and resample to the 16 kHz mono
// PCM that Whisper expects, entirely in the browser — so the server never
// has to decode compressed audio.
async function decodeToMono16k(blob: Blob): Promise<Float32Array> {
  const arrayBuf = await blob.arrayBuffer();
  const Ctx =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext: typeof AudioContext })
      .webkitAudioContext;
  const ctx = new Ctx();
  const decoded = await ctx.decodeAudioData(arrayBuf);
  void ctx.close();

  const frames = Math.max(1, Math.ceil(decoded.duration * SAMPLE_RATE));
  const offline = new OfflineAudioContext(1, frames, SAMPLE_RATE);
  const src = offline.createBufferSource();
  src.buffer = decoded;
  src.connect(offline.destination);
  src.start();
  const rendered = await offline.startRendering();
  return rendered.getChannelData(0);
}

const langOf = (locale: string): "fr" | "en" =>
  locale.toLowerCase().startsWith("fr") ? "fr" : "en";

// Capability detection that survives SSR: `false` on the server, the real
// value on the client, with no hydration mismatch.
const emptySubscribe = () => () => {};

export function useSpeechRecognition(
  onTranscript: (text: string) => void,
  locale: string,
) {
  const supported = useSyncExternalStore(
    emptySubscribe,
    () => getCtor() !== null || canRecord(),
    () => false,
  );
  const [listening, setListening] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Live mic loudness (0–1) while recording — drives the outline pulse.
  const [level, setLevel] = useState(0);

  const callbackRef = useRef(onTranscript);
  const localeRef = useRef(locale);
  useEffect(() => {
    callbackRef.current = onTranscript;
  });
  useEffect(() => {
    localeRef.current = locale;
  }, [locale]);

  // "webspeech" while the native API is active, "recording" while the Whisper
  // fallback captures audio. The ref lets async callbacks see the live mode
  // without stale closures, and guards against events from a strategy we've
  // already moved on from.
  const modeRef = useRef<"none" | "webspeech" | "recording">("none");
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const vadCleanupRef = useRef<(() => void) | null>(null);

  const stopVad = useCallback(() => {
    vadCleanupRef.current?.();
    vadCleanupRef.current = null;
  }, []);

  const cleanupStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  // Recording stopped → decode, upload, transcribe. `listening` stays true
  // through transcription so the mic keeps signalling it's working.
  const finalizeRecording = useCallback(async () => {
    stopVad();
    setLevel(0);
    const chunks = chunksRef.current;
    chunksRef.current = [];
    cleanupStream();
    recorderRef.current = null;

    // Capture is over — switch from "listening" to "transcribing".
    setListening(false);

    const blob = new Blob(chunks, { type: chunks[0]?.type || "audio/webm" });
    if (blob.size === 0) {
      modeRef.current = "none";
      return;
    }

    setTranscribing(true);
    try {
      const samples = await decodeToMono16k(blob);
      const res = await fetch(
        `/api/transcribe?lang=${langOf(localeRef.current)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/octet-stream" },
          body: samples.buffer as ArrayBuffer,
        },
      );
      if (!res.ok) throw new Error("transcribe_failed");
      const data = (await res.json()) as { text?: string };
      const text = (data.text ?? "").trim();
      if (text) callbackRef.current(text);
    } catch {
      setError("transcribe-failed");
    } finally {
      modeRef.current = "none";
      setTranscribing(false);
    }
  }, [cleanupStream, stopVad]);

  const startRecording = useCallback(async () => {
    if (!canRecord()) {
      setError("unavailable");
      setListening(false);
      modeRef.current = "none";
      return;
    }
    // Mark the mode synchronously so a pending Web Speech `onend` doesn't
    // settle us mid-transition while getUserMedia is still resolving.
    modeRef.current = "recording";
    try {
      // Mono + the browser's voice cleanup gives Whisper a cleaner signal.
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => void finalizeRecording();
      recorderRef.current = recorder;
      recorder.start();
      setListening(true);

      // Voice activity detection: auto-stop after a pause so the user never
      // has to click again (mirrors the native Web Speech behaviour).
      try {
        const AudioCtx =
          window.AudioContext ??
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        const audioCtx = new AudioCtx();
        const sourceNode = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 2048;
        sourceNode.connect(analyser);
        const buf = new Float32Array(analyser.fftSize);

        const SILENCE_RMS = 0.015; // below this is "silence"
        const SILENCE_MS = 1500; // pause after speech that ends the take
        const MAX_MS = 15000; // hard cap on a single recording
        const NO_SPEECH_MS = 6000; // give up if nobody ever speaks
        const startedAt = performance.now();
        let speech = false;
        let silenceSince = 0;

        const autoStop = () => {
          stopVad();
          if (recorder.state !== "inactive") recorder.stop();
        };

        const timer = window.setInterval(() => {
          analyser.getFloatTimeDomainData(buf);
          let sum = 0;
          for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
          const rms = Math.sqrt(sum / buf.length);
          const now = performance.now();
          setLevel(Math.min(1, rms * 6));

          if (rms > SILENCE_RMS) {
            speech = true;
            silenceSince = 0;
          } else if (speech) {
            if (!silenceSince) silenceSince = now;
            else if (now - silenceSince > SILENCE_MS) return autoStop();
          }
          if (now - startedAt > MAX_MS) return autoStop();
          if (!speech && now - startedAt > NO_SPEECH_MS) return autoStop();
        }, 100);

        vadCleanupRef.current = () => {
          window.clearInterval(timer);
          sourceNode.disconnect();
          void audioCtx.close();
        };
      } catch {
        // VAD setup failed — recording still works, user stops it by clicking.
      }
    } catch {
      // getUserMedia rejected: permission denied or no input device.
      setError("not-allowed");
      setListening(false);
      setLevel(0);
      modeRef.current = "none";
      cleanupStream();
    }
  }, [finalizeRecording, cleanupStream, stopVad]);

  const startWebSpeech = useCallback(
    (Ctor: SpeechRecognitionCtor) => {
      const recognition = new Ctor();
      recognition.lang = localeRef.current;
      recognition.interimResults = false;
      recognition.continuous = false;
      recognition.onresult = (e) => {
        const transcript = e.results[0]?.[0]?.transcript ?? "";
        modeRef.current = "none";
        setListening(false);
        if (transcript) callbackRef.current(transcript);
      };
      recognition.onerror = (e) => {
        const code = e.error || "unknown";
        // The Arc/Brave case: API present, Google backend unreachable.
        // Transparently switch to local recording + Whisper.
        if (
          (code === "network" || code === "service-not-allowed") &&
          canRecord()
        ) {
          void startRecording();
          return;
        }
        modeRef.current = "none";
        setError(code);
        setListening(false);
      };
      recognition.onend = () => {
        // Only settle if we haven't transitioned to the recording fallback.
        if (modeRef.current === "webspeech") {
          modeRef.current = "none";
          setListening(false);
        }
      };
      recognitionRef.current = recognition;
      modeRef.current = "webspeech";
      try {
        recognition.start();
        setListening(true);
      } catch {
        modeRef.current = "none";
        setError("start-failed");
        setListening(false);
      }
    },
    [startRecording],
  );

  const toggle = useCallback(() => {
    if (transcribing) return; // can't interrupt transcription
    if (listening) {
      if (modeRef.current === "recording") {
        const recorder = recorderRef.current;
        if (recorder && recorder.state !== "inactive") recorder.stop();
      } else if (modeRef.current === "webspeech") {
        recognitionRef.current?.stop();
      } else {
        setListening(false);
      }
      return;
    }

    setError(null);
    const Ctor = getCtor();
    if (Ctor) {
      startWebSpeech(Ctor);
    } else if (canRecord()) {
      void startRecording();
    } else {
      setError("unavailable");
    }
  }, [listening, transcribing, startWebSpeech, startRecording]);

  // Tear everything down on unmount.
  useEffect(
    () => () => {
      stopVad();
      recognitionRef.current?.stop();
      const recorder = recorderRef.current;
      if (recorder && recorder.state !== "inactive") recorder.stop();
      cleanupStream();
    },
    [cleanupStream, stopVad],
  );

  return { supported, listening, transcribing, level, error, toggle };
}
