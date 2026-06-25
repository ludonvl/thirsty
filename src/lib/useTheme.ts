"use client";

import { useCallback, useSyncExternalStore } from "react";

export type Theme = "light" | "dark";

// Persisted color theme. Mirrors useLang: useSyncExternalStore keeps SSR and
// client in sync and survives reloads. The actual `.dark` class on <html> is
// applied up-front by an inline script in layout (avoids a flash) and kept in
// sync here on every change.
const KEY = "thirsty.theme";
const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

/** Stored choice, else the OS preference. Matches the inline script in layout. */
function resolve(): Theme {
  const stored = window.localStorage.getItem(KEY);
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getSnapshot(): Theme {
  if (typeof window === "undefined") return "light";
  return resolve();
}

const getServerSnapshot = (): Theme => "light";

export function useTheme(): [Theme, (theme: Theme) => void] {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const setTheme = useCallback((next: Theme) => {
    window.localStorage.setItem(KEY, next);
    document.documentElement.classList.toggle("dark", next === "dark");
    listeners.forEach((cb) => cb());
  }, []);
  return [theme, setTheme];
}
