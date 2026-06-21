"use client";

import { useEffect, useRef, useState } from "react";
import { useSpeechRecognition } from "@/lib/useSpeechRecognition";
import { useLang } from "@/lib/useLang";
import {
  LANGS,
  SPEECH_LOCALE,
  UI,
  tAlcoholic,
  tCategory,
  type Lang,
} from "@/lib/i18n";
import type { AlcoholFilter, CocktailMatch } from "@/lib/types";

export default function Home() {
  const [lang, setLang] = useLang();
  const t = UI[lang];

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<AlcoholFilter>(null);
  const [results, setResults] = useState<CocktailMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { supported, listening, toggle } = useSpeechRecognition((text) => {
    setQuery(text);
    inputRef.current?.focus();
  }, SPEECH_LOCALE[lang]);

  // Debounced semantic search. AbortController drops stale responses so the
  // results never lag behind the input. Search is language-agnostic — only the
  // display reacts to `lang` — so it is intentionally not a dependency here.
  useEffect(() => {
    const q = query.trim();
    const controller = new AbortController();

    const timer = setTimeout(async () => {
      if (!q) {
        setResults([]);
        setSearched(false);
        return;
      }
      setLoading(true);
      try {
        const url =
          `/api/search?q=${encodeURIComponent(q)}` +
          (filter ? `&filter=${filter}` : "");
        const res = await fetch(url, { signal: controller.signal });
        const data = await res.json();
        setResults(data.results ?? []);
        setSearched(true);
      } catch (err) {
        if (!(err instanceof DOMException && err.name === "AbortError")) {
          console.error(err);
        }
      } finally {
        setLoading(false);
      }
    }, q ? 300 : 0);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [query, filter]);

  const filters: { value: AlcoholFilter; label: string }[] = [
    { value: null, label: t.filters.all },
    { value: "alcoholic", label: t.filters.alcoholic },
    { value: "non-alcoholic", label: t.filters.nonAlcoholic },
  ];

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-12 sm:py-20">
      <header className="mb-8 text-center">
        <div className="mb-4 flex justify-center gap-1">
          {LANGS.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLang(l)}
              aria-pressed={lang === l}
              className={`rounded-md px-2 py-0.5 text-xs font-medium uppercase transition ${
                lang === l
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "text-black/40 hover:text-black/70 dark:text-white/40 dark:hover:text-white/70"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
        <h1 className="font-display text-[72px] font-normal tracking-tight">
          🍸 Thirsty
        </h1>
        <p className="mt-2 text-[28px] font-medium text-black/50 dark:text-white/50">
          {t.tagline}
        </p>
      </header>

      {/* Search bar — mic on the left, input filling the rest. */}
      <div className="sticky top-4 z-10 flex items-center gap-2 rounded-full border border-black/10 bg-white px-2 py-2 shadow-sm dark:border-white/15 dark:bg-neutral-900">
        {supported && (
          <button
            type="button"
            onClick={toggle}
            aria-label={listening ? t.stopListening : t.listen}
            aria-pressed={listening}
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition ${
              listening
                ? "animate-pulse bg-red-500 text-white"
                : "bg-black/5 text-black/60 hover:bg-black/10 dark:bg-white/10 dark:text-white/70 dark:hover:bg-white/20"
            }`}
          >
            <MicIcon />
          </button>
        )}
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.placeholder}
          className="min-w-0 flex-1 bg-transparent px-2 text-base outline-none placeholder:text-black/30 dark:placeholder:text-white/30"
        />
        {loading && <Spinner />}
      </div>

      {/* Alcohol filter chips */}
      <div className="mt-3 flex justify-center gap-2">
        {filters.map(({ value, label }) => {
          const active = filter === value;
          return (
            <button
              key={label}
              type="button"
              onClick={() => setFilter(value)}
              aria-pressed={active}
              className={`rounded-full px-3 py-1 text-sm transition ${
                active
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "bg-black/5 text-black/60 hover:bg-black/10 dark:bg-white/10 dark:text-white/70 dark:hover:bg-white/20"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Results */}
      <section className="mt-8 space-y-4">
        {searched && !loading && results.length === 0 && (
          <p className="text-center text-sm text-black/40 dark:text-white/40">
            {t.empty}
          </p>
        )}
        {results.map((c) => (
          <CocktailCard key={c.id} cocktail={c} lang={lang} />
        ))}
      </section>
    </main>
  );
}

function CocktailCard({
  cocktail,
  lang,
}: {
  cocktail: CocktailMatch;
  lang: Lang;
}) {
  const category = tCategory(cocktail.category, lang);
  const alcoholic = tAlcoholic(cocktail.alcoholic, lang);

  return (
    <article className="flex gap-4 overflow-hidden rounded-2xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-neutral-900">
      {cocktail.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={cocktail.image}
          alt={cocktail.name}
          className="h-24 w-24 shrink-0 rounded-xl object-cover"
          loading="lazy"
        />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <h2 className="text-lg font-semibold">{cocktail.name}</h2>
          {category && (
            <span className="rounded-full bg-black/5 px-2 py-0.5 text-xs text-black/50 dark:bg-white/10 dark:text-white/50">
              {category}
            </span>
          )}
          {alcoholic && (
            <span className="rounded-full bg-black/5 px-2 py-0.5 text-xs text-black/50 dark:bg-white/10 dark:text-white/50">
              {alcoholic}
            </span>
          )}
        </div>

        {cocktail.ingredients.length > 0 && (
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {cocktail.ingredients.map((ing, i) => (
              <li
                key={i}
                className="rounded-md bg-amber-500/10 px-2 py-0.5 text-xs text-amber-700 dark:text-amber-300"
              >
                {ing.measure ? `${ing.measure} ` : ""}
                {ing.name[lang]}
              </li>
            ))}
          </ul>
        )}

        {cocktail.instructions[lang] && (
          <p className="mt-3 text-sm leading-relaxed text-black/70 dark:text-white/70">
            {cocktail.instructions[lang]}
          </p>
        )}
      </div>
    </article>
  );
}

function MicIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="22" />
    </svg>
  );
}

function Spinner() {
  return (
    <div className="mr-2 h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-black/20 border-t-black/60 dark:border-white/20 dark:border-t-white/60" />
  );
}
