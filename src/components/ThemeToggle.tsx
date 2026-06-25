"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/useTheme";
import { useLang } from "@/lib/useLang";
import { UI } from "@/lib/i18n";

// Fixed light/dark switch in the top-left corner, present on every view.
export function ThemeToggle() {
  const [theme, setTheme] = useTheme();
  const [lang] = useLang();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? UI[lang].theme.light : UI[lang].theme.dark}
      title={isDark ? UI[lang].theme.light : UI[lang].theme.dark}
      className="fixed left-4 top-4 z-20 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-black/10 bg-white text-black/70 shadow-sm transition hover:border-black/20 hover:bg-black/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/30 dark:border-white/15 dark:bg-neutral-900 dark:text-white/80 dark:hover:bg-white/20 dark:focus-visible:ring-white/30"
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
