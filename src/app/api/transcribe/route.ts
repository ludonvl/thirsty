import { NextResponse } from "next/server";
import { transcribe } from "@/lib/transcribe";

export const runtime = "nodejs";

// Accepts a raw Float32Array of 16 kHz mono PCM samples (the client decodes and
// resamples the recording before uploading, so the server never has to decode
// webm/opus). Returns the transcript.
export async function POST(request: Request) {
  const lang = new URL(request.url).searchParams.get("lang") === "en"
    ? "en"
    : "fr";

  try {
    const buffer = await request.arrayBuffer();
    if (buffer.byteLength === 0) {
      return NextResponse.json({ error: "empty_audio" }, { status: 400 });
    }
    const samples = new Float32Array(buffer);
    const text = await transcribe(samples, lang);
    return NextResponse.json({ text });
  } catch (err) {
    console.error("transcribe failed:", err);
    return NextResponse.json({ error: "transcribe_failed" }, { status: 500 });
  }
}
