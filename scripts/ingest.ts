/**
 * One-off ingestion: fetch every cocktail from TheCocktailDB, normalize it,
 * translate the English-only fields to French locally, build a bilingual
 * embedding, and write the index to disk.
 *
 * Run with: npm run ingest
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { embed, asPassage } from "../src/lib/embeddings";
import { translateEnToFr } from "../src/lib/translate";
import { ingredientOverride } from "../src/lib/ingredientOverrides";
import type { Cocktail, Ingredient } from "../src/lib/types";

const API = "https://www.thecocktaildb.com/api/json/v1/1/search.php?f=";
const LETTERS = "abcdefghijklmnopqrstuvwxyz".split("");
const DATA_DIR = join(process.cwd(), "data");

type RawDrink = Record<string, string | null> & {
  idDrink: string;
  strDrink: string;
};

// Intermediate shape before French fields are filled in.
interface Normalized {
  id: string;
  name: string;
  category: string | null;
  glass: string | null;
  alcoholic: string | null;
  image: string | null;
  ingredients: { measure: string | null; nameEn: string }[];
  instructionsEn: string;
  /** Native French instructions from the source, if any. */
  instructionsFrNative: string | null;
}

function normalize(d: RawDrink): Normalized {
  const ingredients: { measure: string | null; nameEn: string }[] = [];
  for (let i = 1; i <= 15; i++) {
    const nameEn = d[`strIngredient${i}`]?.trim();
    if (!nameEn) continue;
    ingredients.push({ measure: d[`strMeasure${i}`]?.trim() || null, nameEn });
  }

  return {
    id: d.idDrink,
    name: d.strDrink,
    category: d.strCategory ?? null,
    glass: d.strGlass ?? null,
    alcoholic: d.strAlcoholic ?? null,
    image: d.strDrinkThumb ?? null,
    ingredients,
    instructionsEn: d.strInstructions?.trim() ?? "",
    instructionsFrNative: d.strInstructionsFR?.trim() || null,
  };
}

/** Embed both languages so search matches regardless of the query language. */
function passageText(c: Cocktail): string {
  const ingredients = c.ingredients
    .flatMap((i) => [i.name.en, i.name.fr])
    .join(", ");
  return asPassage(
    [c.name, c.category, ingredients, c.instructions.en, c.instructions.fr]
      .filter(Boolean)
      .join(". "),
  );
}

async function main() {
  console.log("Fetching cocktails from TheCocktailDB…");
  const byId = new Map<string, RawDrink>();
  for (const letter of LETTERS) {
    const res = await fetch(API + letter);
    if (!res.ok) continue;
    const json = (await res.json()) as { drinks: RawDrink[] | null };
    for (const drink of json.drinks ?? []) byId.set(drink.idDrink, drink);
    process.stdout.write(`  ${letter}: ${byId.size} total\r`);
  }
  const normalized = [...byId.values()].map(normalize);
  console.log(`\nNormalized ${normalized.length} cocktails.`);

  // Translate every distinct ingredient name once (first run downloads the
  // translation model).
  const uniqueNames = [
    ...new Set(normalized.flatMap((c) => c.ingredients.map((i) => i.nameEn))),
  ];
  console.log(`Translating ${uniqueNames.length} unique ingredient names…`);
  const nameFr = new Map<string, string>();
  for (let i = 0; i < uniqueNames.length; i++) {
    // Prefer a hand-checked override; fall back to machine translation.
    const fr = ingredientOverride(uniqueNames[i]) ?? (await translateEnToFr(uniqueNames[i]));
    nameFr.set(uniqueNames[i], fr);
    process.stdout.write(`  ${i + 1}/${uniqueNames.length}\r`);
  }

  // Translate instructions that have no native French version.
  const needFr = normalized.filter((c) => !c.instructionsFrNative);
  console.log(`\nTranslating ${needFr.length} instruction blocks…`);
  const instrFr = new Map<string, string>();
  for (let i = 0; i < needFr.length; i++) {
    const c = needFr[i];
    instrFr.set(c.id, await translateEnToFr(c.instructionsEn));
    process.stdout.write(`  ${i + 1}/${needFr.length}\r`);
  }

  const cocktails: Cocktail[] = normalized.map((c) => {
    const ingredients: Ingredient[] = c.ingredients.map((ing) => ({
      measure: ing.measure,
      name: { en: ing.nameEn, fr: nameFr.get(ing.nameEn) ?? ing.nameEn },
    }));
    return {
      id: c.id,
      name: c.name,
      category: c.category,
      glass: c.glass,
      alcoholic: c.alcoholic,
      image: c.image,
      ingredients,
      instructions: {
        en: c.instructionsEn,
        fr: c.instructionsFrNative ?? instrFr.get(c.id) ?? c.instructionsEn,
      },
    };
  });

  console.log("\nGenerating bilingual embeddings…");
  const embeddings: number[][] = [];
  for (let i = 0; i < cocktails.length; i++) {
    embeddings.push(await embed(passageText(cocktails[i])));
    if ((i + 1) % 25 === 0 || i === cocktails.length - 1) {
      process.stdout.write(`  ${i + 1}/${cocktails.length}\r`);
    }
  }

  mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(join(DATA_DIR, "cocktails.json"), JSON.stringify(cocktails));
  writeFileSync(join(DATA_DIR, "embeddings.json"), JSON.stringify(embeddings));
  console.log(
    `\nDone. Wrote ${cocktails.length} cocktails and ${embeddings.length} vectors (${embeddings[0]?.length ?? 0} dims).`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
