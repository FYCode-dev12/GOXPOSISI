import { NextResponse } from "next/server";
import { getSupabaseUser } from "@/lib/supabase/server";
import { validateArticleMdx } from "@/lib/article-validation";

export async function POST(request: Request) {
  const user = await getSupabaseUser();
  if (user?.app_metadata?.role !== "admin") return NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 });
  try {
    const body = await request.json() as { content?: string };
    if (typeof body.content !== "string") return NextResponse.json({ error: "content wajib diisi." }, { status: 400 });
    const { frontmatter, content } = validateArticleMdx(body.content);
    return NextResponse.json({ frontmatter, content });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Preview gagal." }, { status: 400 });
  }
}
