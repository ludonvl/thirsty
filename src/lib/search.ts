import { readFileSync } from "node:fs";
import { join } from "node:path";
import { embed, asQuery } from "./embeddings";
import type { AlcoholFilter, Cocktail, CocktailMatch } from "./types";

// Load the precomputed index once per server process. At ~600 vectors a
// brute-force cosine scan is effectively instant, so no vector DB is needed.
let index: { cocktails: Cocktail[]; vectors: number[][] } | null = null;

function getIndex() {
  if (!index) {
    const dir = join(process.cwd(), "data");
    const cocktails = JSON.parse(
      readFileSync(join(dir, "cocktails.json"), "utf8"),
    ) as Cocktail[];
    const vectors = JSON.parse(
      readFileSync(join(dir, "embeddings.json"), "utf8"),
    ) as number[][];
    index = { cocktails, vectors };
  }
  return index;
}

// Vectors are L2-normalized at embedding time, so cosine similarity is just
// the dot product.
function dot(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += a[i] * b[i];
  return sum;
}

// Phrases that express an alcohol preference. We check non-alcoholic first so
// "non alcoolisé" is never mistaken for "alcoolisé".
const NON_ALCOHOLIC = [
  /\bsans alcool\b/gi,
  /\bnon[-\s]?alcoolis\w*/gi,
  /\bnon[-\s]?alcoholic\b/gi,
  /\bno alcohol\b/gi,
  /\bmocktail\b/gi,
  /\bvierges?\b/gi,
];
const ALCOHOLIC = [/\bavec alcool\b/gi, /\balcoolis\w*/gi, /\balcoholic\b/gi];

/**
 * Detect an alcohol preference and strip its phrasing from the query, because
 * embedding models handle negation poorly — leaving "sans alcool" in the text
 * pulls the vector *toward* alcoholic drinks. We filter on metadata instead.
 */
function parseAlcoholFilter(query: string): {
  filter: AlcoholFilter;
  cleaned: string;
} {
  const strip = (text: string, patterns: RegExp[]) =>
    patterns.reduce((acc, p) => acc.replace(p, " "), text);
  const tidy = (text: string) => text.replace(/\s+/g, " ").trim();

  const withoutNon = strip(query, NON_ALCOHOLIC);
  if (withoutNon !== query) {
    // Matched a non-alcoholic phrase; also drop any leftover bare "alcool".
    return { filter: "non-alcoholic", cleaned: tidy(strip(withoutNon, ALCOHOLIC)) };
  }

  const withoutAlc = strip(query, ALCOHOLIC);
  if (withoutAlc !== query) {
    return { filter: "alcoholic", cleaned: tidy(withoutAlc) };
  }

  return { filter: null, cleaned: tidy(query) };
}

function passesFilter(alcoholic: string | null, filter: AlcoholFilter): boolean {
  if (!filter) return true;
  const a = (alcoholic ?? "").toLowerCase();
  if (filter === "non-alcoholic") return a.includes("non");
  return a.includes("alcoholic") && !a.includes("non");
}

export async function search(
  query: string,
  opts: { filter?: AlcoholFilter; topK?: number } = {},
): Promise<CocktailMatch[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const { cocktails, vectors } = getIndex();
  const { filter: detected, cleaned } = parseAlcoholFilter(trimmed);

  // An explicit UI choice wins over phrasing detected in the query text.
  const filter = opts.filter ?? detected;
  const topK = opts.topK ?? 12;

  // If the query was *only* an alcohol preference, fall back to the original
  // text so we still have something meaningful to rank by.
  const queryVec = await embed(asQuery(cleaned || trimmed));

  const matches: CocktailMatch[] = [];
  for (let i = 0; i < cocktails.length; i++) {
    if (!passesFilter(cocktails[i].alcoholic, filter)) continue;
    matches.push({ ...cocktails[i], score: dot(queryVec, vectors[i]) });
  }

  return matches.sort((a, b) => b.score - a.score).slice(0, topK);
}
