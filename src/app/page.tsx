"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeft, LayoutGrid, Leaf, Loader2, Martini, Mic } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useSpeechRecognition } from "@/lib/useSpeechRecognition";
import { useLang } from "@/lib/useLang";
import {
  LANGS,
  SPEECH_LOCALE,
  UI,
  tAlcoholic,
  tCategory,
  tMicError,
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
  const [selected, setSelected] = useState<CocktailMatch | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    supported,
    listening,
    transcribing,
    level,
    error: micError,
    toggle,
  } = useSpeechRecognition((text) => {
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

  const filters: { value: AlcoholFilter; label: string; Icon: LucideIcon }[] = [
    { value: null, label: t.filters.all, Icon: LayoutGrid },
    { value: "alcoholic", label: t.filters.alcoholic, Icon: Martini },
    { value: "non-alcoholic", label: t.filters.nonAlcoholic, Icon: Leaf },
  ];

  if (selected) {
    return (
      <CocktailDetail
        cocktail={selected}
        lang={lang}
        onBack={() => setSelected(null)}
      />
    );
  }

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
              className={`rounded-md px-2 py-1 text-xs font-medium uppercase transition ${
                lang === l
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "text-black/50 hover:text-black/70 dark:text-white/50 dark:hover:text-white/70"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-center gap-2">
          <Image
            src="/logo.png"
            alt=""
            width={128}
            height={128}
            priority
          />
          <h1 className="font-display text-7xl font-normal tracking-tight">
            Thirsty
          </h1>
        </div>
        <p className="mt-2 text-2xl font-normal text-black/60 dark:text-white/60">
          {t.tagline}
        </p>
      </header>

      {/* Search bar — mic on the left, input filling the rest. */}
      <div
        style={
          listening
            ? {
                boxShadow: `0 0 0 ${3 + level * 12}px rgba(239, 68, 68, ${
                  0.1 + level * 0.4
                })`,
                transition: "box-shadow 100ms ease-out",
              }
            : undefined
        }
        className="sticky top-4 z-10 flex items-center gap-2 rounded-full border border-black/10 bg-white px-2 py-2 shadow-sm transition focus-within:ring-2 focus-within:ring-black/15 dark:border-white/15 dark:bg-neutral-900 dark:focus-within:ring-white/20"
      >
        {supported && (
          <button
            type="button"
            onClick={toggle}
            disabled={transcribing}
            aria-label={
              transcribing
                ? t.transcribing
                : listening
                  ? t.stopListening
                  : t.listen
            }
            aria-pressed={listening}
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition ${
              listening
                ? "animate-pulse bg-red-500 text-white"
                : "bg-black/5 text-black/60 hover:bg-black/10 dark:bg-white/10 dark:text-white/70 dark:hover:bg-white/20"
            }`}
          >
            {transcribing ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Mic size={20} />
            )}
          </button>
        )}
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.placeholder}
          className="min-w-0 flex-1 bg-transparent px-2 text-base outline-none placeholder:text-black/50 dark:placeholder:text-white/50"
        />
        {loading && <Spinner />}
      </div>

      {micError && (
        <p
          role="alert"
          className="mt-2 text-center text-sm text-red-600 dark:text-red-400"
        >
          {tMicError(micError, lang)}
        </p>
      )}

      {/* Alcohol filter chips */}
      <div className="mt-3 flex justify-center gap-2">
        {filters.map(({ value, label, Icon }) => {
          const active = filter === value;
          return (
            <button
              key={label}
              type="button"
              onClick={() => setFilter(value)}
              aria-pressed={active}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-sm transition ${
                active
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "bg-black/5 text-black/60 hover:bg-black/10 dark:bg-white/10 dark:text-white/70 dark:hover:bg-white/20"
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          );
        })}
      </div>

      {/* Results */}
      <section className="mt-8 space-y-4">
        {searched && !loading && results.length === 0 && (
          <p className="text-center text-sm text-black/60 dark:text-white/60">
            {t.empty}
          </p>
        )}
        {results.map((c) => (
          <CocktailCard
            key={c.id}
            cocktail={c}
            lang={lang}
            onSelect={() => setSelected(c)}
          />
        ))}
      </section>
    </main>
  );
}

function CocktailCard({
  cocktail,
  lang,
  onSelect,
}: {
  cocktail: CocktailMatch;
  lang: Lang;
  onSelect: () => void;
}) {
  const category = tCategory(cocktail.category, lang);
  const alcoholic = tAlcoholic(cocktail.alcoholic, lang);

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className="flex cursor-pointer gap-4 overflow-hidden rounded-2xl border border-black/10 bg-white p-4 transition hover:border-black/20 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-black/30 dark:border-white/10 dark:bg-neutral-900 dark:hover:border-white/25 dark:focus-visible:ring-white/30"
    >
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
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <h2 className="text-lg font-semibold">{cocktail.name}</h2>
          {category && (
            <span className="rounded-full bg-black/5 px-2 py-0.5 text-xs text-black/60 dark:bg-white/10 dark:text-white/60">
              {category}
            </span>
          )}
          {alcoholic && (
            <span className="rounded-full bg-black/5 px-2 py-0.5 text-xs text-black/60 dark:bg-white/10 dark:text-white/60">
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

function CocktailDetail({
  cocktail,
  lang,
  onBack,
}: {
  cocktail: CocktailMatch;
  lang: Lang;
  onBack: () => void;
}) {
  const t = UI[lang];
  const category = tCategory(cocktail.category, lang);
  const alcoholic = tAlcoholic(cocktail.alcoholic, lang);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-6 sm:py-10">
      <button
        type="button"
        onClick={onBack}
        className="sticky top-4 z-10 mb-4 inline-flex w-fit cursor-pointer items-center gap-2 self-start rounded-full border border-black/10 px-4 py-2 text-sm font-medium shadow-sm transition bg-white hover:border-black/20 hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/30 dark:border-white/15 dark:bg-neutral-900 dark:hover:bg-neutral-700 dark:focus-visible:ring-white/30"
      >
        <ArrowLeft size={16} />
        {t.back}
      </button>

      <article className="flex flex-1 flex-col overflow-hidden rounded-3xl border border-black/10 bg-white dark:border-white/10 dark:bg-neutral-900">
        {cocktail.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cocktail.image}
            alt={cocktail.name}
            className="h-56 w-full shrink-0 object-cover sm:h-72"
          />
        )}

        <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
          <div>
            <h1 className="font-display text-4xl font-normal tracking-tight">
              {cocktail.name}
            </h1>
            <div className="mt-3 flex flex-wrap gap-2">
              {category && <Badge>{category}</Badge>}
              {alcoholic && <Badge>{alcoholic}</Badge>}
              {cocktail.glass && (
                <Badge>
                  {t.glass}: {cocktail.glass}
                </Badge>
              )}
            </div>
          </div>

          {cocktail.ingredients.length > 0 && (
            <section>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-black/50 dark:text-white/50">
                {t.ingredients}
              </h2>
              <ul className="space-y-1.5">
                {cocktail.ingredients.map((ing, i) => (
                  <li
                    key={i}
                    className="flex items-baseline justify-between gap-4 border-b border-black/5 pb-1.5 text-sm dark:border-white/10"
                  >
                    <span>{ing.name[lang]}</span>
                    {ing.measure && (
                      <span className="shrink-0 text-black/50 dark:text-white/50">
                        {ing.measure}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {cocktail.instructions[lang] && (
            <section>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-black/50 dark:text-white/50">
                {t.preparation}
              </h2>
              <p className="text-base leading-relaxed text-black/80 dark:text-white/80">
                {cocktail.instructions[lang]}
              </p>
            </section>
          )}
        </div>
      </article>
    </main>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-black/5 px-2.5 py-1 text-xs text-black/60 dark:bg-white/10 dark:text-white/60">
      {children}
    </span>
  );
}

function Spinner() {
  return (
    <Loader2 className="mr-2 h-5 w-5 shrink-0 animate-spin text-black/60 dark:text-white/60" />
  );
}
