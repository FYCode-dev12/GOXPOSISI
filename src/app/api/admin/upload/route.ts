import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getSupabaseUser } from "@/lib/supabase/server";
import { getBookTaxonomy } from "@/lib/books-taxonomy";
import { validateArticleMdx } from "@/lib/article-validation";

function isAdmin(user: { app_metadata?: Record<string, unknown> } | null) {
  return user?.app_metadata?.role === "admin";
}

export async function POST(request: Request) {
  const user = await getSupabaseUser();
  if (!isAdmin(user)) return NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 });

  try {
    const body = await request.json() as { content?: string; publish?: boolean };
    if (typeof body.content !== "string") return NextResponse.json({ error: "content wajib berupa string." }, { status: 400 });
    const validated = validateArticleMdx(body.content);
    const book = getBookTaxonomy(validated.frontmatter.kitab);
    if (!book) throw new Error("Kitab tidak valid.");
    const date = new Date(validated.frontmatter.date).toISOString().slice(0, 10);
    const admin = getSupabaseAdmin();
    const { data, error } = await admin.from("articles").upsert({
      kitab: validated.frontmatter.kitab,
      pasal: validated.frontmatter.pasal,
      title: validated.frontmatter.title,
      summary: validated.frontmatter.summary ?? null,
      tags: validated.frontmatter.tags ?? [],
      author: validated.frontmatter.author,
      date,
      content: validated.content,
      status: body.publish ? "published" : "draft",
    }, { onConflict: "kitab,pasal" }).select("id,kitab,pasal,status").single();
    if (error) throw new Error(error.message);
    if (body.publish) {
      revalidatePath(`/kitab/${book.slug}/${validated.frontmatter.pasal}`);
      revalidatePath(`/kitab/${book.slug}`);
      revalidatePath("/");
      revalidatePath("/tema");
      revalidatePath("/cari");
    }
    return NextResponse.json({ article: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Upload gagal." }, { status: 400 });
  }
}
