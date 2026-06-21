"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { Lang } from "./i18n";

// Persisted UI language. useSyncExternalStore keeps SSR ("fr") and the client
// in sync without an effect-driven setState, and survives reloads.
const KEY = "thirsty.lang";
const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function getSnapshot(): Lang {
  if (typeof window === "undefined") return "fr";
  const v = window.localStorage.getItem(KEY);
  return v === "en" || v === "fr" ? v : "fr";
}

const getServerSnapshot = (): Lang => "fr";

export function useLang(): [Lang, (lang: Lang) => void] {
  const lang = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const setLang = useCallback((next: Lang) => {
    window.localStorage.setItem(KEY, next);
    listeners.forEach((cb) => cb());
  }, []);
  return [lang, setLang];
}
