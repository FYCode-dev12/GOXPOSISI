import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getSupabaseUser } from "@/lib/supabase/server";
import { getBookTaxonomy } from "@/lib/books-taxonomy";

async function requireAdmin() {
  const user = await getSupabaseUser();
  return user?.app_metadata?.role === "admin";
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 });
  const { data, error } = await getSupabaseAdmin().from("book_backgrounds").select("kitab,content,updated_at").order("kitab");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ backgrounds: data ?? [] });
}

export async function PUT(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 });
  try {
    const body = await request.json() as { kitab?: string; content?: string };
    if (typeof body.kitab !== "string" || !getBookTaxonomy(body.kitab)) return NextResponse.json({ error: "Kitab tidak valid." }, { status: 400 });
    if (typeof body.content !== "string" || !body.content.trim()) return NextResponse.json({ error: "Isi latar belakang wajib diisi." }, { status: 400 });
    if (body.content.length > 120_000) return NextResponse.json({ error: "Latar belakang maksimal 120 KB." }, { status: 400 });
    if (/<script/i.test(body.content) || /on\w+\s*=\s*["']/i.test(body.content)) return NextResponse.json({ error: "HTML/script tidak diizinkan." }, { status: 400 });
    const { data, error } = await getSupabaseAdmin().from("book_backgrounds").upsert({ kitab: body.kitab, content: body.content }, { onConflict: "kitab" }).select("kitab,content,updated_at").single();
    if (error) throw new Error(error.message);
    revalidatePath("/");
    revalidatePath(`/kitab/${body.kitab}`);
    revalidatePath("/sitemap.xml");
    return NextResponse.json({ background: data });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Gagal menyimpan latar belakang." }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 });
  const body = await request.json() as { kitab?: string };
  if (typeof body.kitab !== "string" || !getBookTaxonomy(body.kitab)) return NextResponse.json({ error: "Kitab tidak valid." }, { status: 400 });
  const { error } = await getSupabaseAdmin().from("book_backgrounds").delete().eq("kitab", body.kitab);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  revalidatePath("/");
  revalidatePath(`/kitab/${body.kitab}`);
  return NextResponse.json({ ok: true });
}
