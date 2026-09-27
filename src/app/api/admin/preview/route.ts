import { NextResponse } from "next/server";
import { getSupabaseUser } from "@/lib/supabase/server";
import { validateArticleMdx } from "@/lib/article-validation";
import { enforceSameOrigin, readJsonBody } from "@/lib/admin-api";

const MAX_REQUEST_BYTES = 650_000;

export async function POST(request: Request) {
  const user = await getSupabaseUser();
  if (user?.app_metadata?.role !== "admin") return NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 });
  const originError = enforceSameOrigin(request);
  if (originError) return originError;
  const parsed = await readJsonBody<{ content?: string }>(request, MAX_REQUEST_BYTES);
  if ("response" in parsed) return parsed.response;

  try {
    const body = parsed.data;
    if (typeof body.content !== "string") return NextResponse.json({ error: "content wajib diisi." }, { status: 400 });
    const { frontmatter, content } = validateArticleMdx(body.content);
    return NextResponse.json({ frontmatter, content }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Preview gagal." }, { status: 400 });
  }
}
