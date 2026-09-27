import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getSupabaseUser } from "@/lib/supabase/server";
import { getBookTaxonomy } from "@/lib/books-taxonomy";
import { validateArticleMdx } from "@/lib/article-validation";
import { enforceSameOrigin, readJsonBody, serverError } from "@/lib/admin-api";

const MAX_ARTICLE_BYTES = 650_000;
const MAX_DELETE_BYTES = 2_000;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function requireAdmin() {
  const user = await getSupabaseUser();
  return user?.app_metadata?.role === "admin";
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 });
  const { data, error } = await getSupabaseAdmin().from("articles").select("id,kitab,pasal,title,summary,tags,author,date,content,status,updated_at").order("updated_at", { ascending: false });
  if (error) {
    console.error("Article list failed", { code: error.code });
    return serverError("Gagal memuat artikel.");
  }
  return NextResponse.json({ articles: data }, { headers: { "Cache-Control": "no-store" } });
}

export async function PUT(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 });
  const originError = enforceSameOrigin(request);
  if (originError) return originError;
  const parsed = await readJsonBody<{ id?: string; content?: string; publish?: boolean }>(request, MAX_ARTICLE_BYTES);
  if ("response" in parsed) return parsed.response;

  try {
    const body = parsed.data;
    if (!body.id || !UUID_PATTERN.test(body.id) || typeof body.content !== "string") return NextResponse.json({ error: "id dan content tidak valid." }, { status: 400 });
    const validated = validateArticleMdx(body.content);
    const book = getBookTaxonomy(validated.frontmatter.kitab);
    if (!book) throw new Error("Kitab tidak valid.");
    const { data, error } = await getSupabaseAdmin().from("articles").update({
      kitab: validated.frontmatter.kitab,
      pasal: validated.frontmatter.pasal,
      title: validated.frontmatter.title,
      summary: validated.frontmatter.summary ?? null,
      tags: validated.frontmatter.tags ?? [],
      author: validated.frontmatter.author,
      date: new Date(validated.frontmatter.date).toISOString().slice(0, 10),
      content: validated.content,
      status: body.publish ? "published" : "draft",
    }).eq("id", body.id).select("id,kitab,pasal,status").single();
    if (error) {
      console.error("Article update failed", { code: error.code });
      return serverError("Gagal memperbarui artikel.");
    }
    revalidatePath(`/kitab/${book.slug}/${validated.frontmatter.pasal}`);
    revalidatePath(`/kitab/${book.slug}`);
    revalidatePath("/");
    revalidatePath("/tema");
    revalidatePath("/cari");
    revalidatePath("/sitemap.xml");
    return NextResponse.json({ article: data });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Update gagal." }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 });
  const originError = enforceSameOrigin(request);
  if (originError) return originError;
  const parsed = await readJsonBody<{ id?: string }>(request, MAX_DELETE_BYTES);
  if ("response" in parsed) return parsed.response;
  const body = parsed.data;
  if (!body.id || !UUID_PATTERN.test(body.id)) return NextResponse.json({ error: "id tidak valid." }, { status: 400 });
  const { data, error } = await getSupabaseAdmin().from("articles").delete().eq("id", body.id).select("kitab,pasal").single();
  if (error) {
    console.error("Article delete failed", { code: error.code });
    return serverError("Gagal menghapus artikel.");
  }
  if (data) {
    revalidatePath(`/kitab/${data.kitab}/${data.pasal}`);
    revalidatePath(`/kitab/${data.kitab}`);
    revalidatePath("/");
    revalidatePath("/tema");
    revalidatePath("/cari");
    revalidatePath("/sitemap.xml");
  }
  return NextResponse.json({ ok: true });
}
