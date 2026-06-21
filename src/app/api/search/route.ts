import { NextResponse } from "next/server";
import { search } from "@/lib/search";
import type { AlcoholFilter } from "@/lib/types";

// Embedding + filesystem index access require the Node.js runtime.
export const runtime = "nodejs";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const q = params.get("q") ?? "";
  const raw = params.get("filter");
  const filter: AlcoholFilter =
    raw === "alcoholic" || raw === "non-alcoholic" ? raw : null;

  if (!q.trim()) {
    return NextResponse.json({ results: [] });
  }

  try {
    const results = await search(q, { filter });
    return NextResponse.json({ results });
  } catch (err) {
    console.error("search failed:", err);
    return NextResponse.json(
      { error: "search_failed" },
      { status: 500 },
    );
  }
}
