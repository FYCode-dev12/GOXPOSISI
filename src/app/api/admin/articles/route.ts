import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getSupabaseUser } from "@/lib/supabase/server";
import { getBookTaxonomy } from "@/lib/books-taxonomy";
import { validateArticleMdx } from "@/lib/article-validation";

async function requireAdmin() {
  const user = await getSupabaseUser();
  return user?.app_metadata?.role === "admin";
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 });
  const { data, error } = await getSupabaseAdmin().from("articles").select("id,kitab,pasal,title,summary,tags,author,date,content,status,updated_at").order("updated_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ articles: data });
}

export async function PUT(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 });
  try {
    const body = await request.json() as { id?: string; content?: string; publish?: boolean };
    if (!body.id || typeof body.content !== "string") return NextResponse.json({ error: "id dan content wajib diisi." }, { status: 400 });
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
    if (error) throw new Error(error.message);
    revalidatePath(`/kitab/${book.slug}/${validated.frontmatter.pasal}`);
    revalidatePath(`/kitab/${book.slug}`);
    revalidatePath("/");
    revalidatePath("/tema");
    revalidatePath("/cari");
    return NextResponse.json({ article: data });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Update gagal." }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 });
  const body = await request.json() as { id?: string };
  if (!body.id) return NextResponse.json({ error: "id wajib diisi." }, { status: 400 });
  const { data, error } = await getSupabaseAdmin().from("articles").delete().eq("id", body.id).select("kitab,pasal").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (data) {
    revalidatePath(`/kitab/${data.kitab}/${data.pasal}`);
    revalidatePath(`/kitab/${data.kitab}`);
    revalidatePath("/");
    revalidatePath("/tema");
    revalidatePath("/cari");
  }
  return NextResponse.json({ ok: true });
}
