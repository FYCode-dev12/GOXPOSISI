import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getSupabaseUser } from "@/lib/supabase/server";
import { getBookTaxonomy } from "@/lib/books-taxonomy";
import { enforceSameOrigin, readJsonBody, serverError } from "@/lib/admin-api";

const MAX_BACKGROUND_BYTES = 130_000;
const MAX_DELETE_BYTES = 2_000;

async function requireAdmin() {
  const user = await getSupabaseUser();
  return user?.app_metadata?.role === "admin";
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 });
  const { data, error } = await getSupabaseAdmin().from("book_backgrounds").select("kitab,content,updated_at").order("kitab");
  if (error) {
    console.error("Background list failed", { code: error.code });
    return serverError("Gagal memuat latar belakang.");
  }
  return NextResponse.json({ backgrounds: data ?? [] }, { headers: { "Cache-Control": "no-store" } });
}

export async function PUT(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 });
  const originError = enforceSameOrigin(request);
  if (originError) return originError;
  const parsed = await readJsonBody<{ kitab?: string; content?: string }>(request, MAX_BACKGROUND_BYTES);
  if ("response" in parsed) return parsed.response;

  try {
    const body = parsed.data;
    if (typeof body.kitab !== "string" || !getBookTaxonomy(body.kitab)) return NextResponse.json({ error: "Kitab tidak valid." }, { status: 400 });
    if (typeof body.content !== "string" || !body.content.trim()) return NextResponse.json({ error: "Isi latar belakang wajib diisi." }, { status: 400 });
    if (body.content.length > 120_000) return NextResponse.json({ error: "Latar belakang maksimal 120 KB." }, { status: 400 });
    if (/<script/i.test(body.content) || /on\w+\s*=\s*["']/i.test(body.content)) return NextResponse.json({ error: "HTML/script tidak diizinkan." }, { status: 400 });
    const { data, error } = await getSupabaseAdmin().from("book_backgrounds").upsert({ kitab: body.kitab, content: body.content }, { onConflict: "kitab" }).select("kitab,content,updated_at").single();
    if (error) {
      console.error("Background update failed", { code: error.code });
      return serverError("Gagal menyimpan latar belakang.");
    }
    revalidatePath("/");
    revalidatePath(`/kitab/${body.kitab}`);
    revalidatePath(`/latar-belakang/${body.kitab}`);
    revalidatePath("/latar-belakang");
    revalidatePath("/sitemap.xml");
    return NextResponse.json({ background: data });
  } catch {
    return NextResponse.json({ error: "Gagal menyimpan latar belakang." }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 });
  const originError = enforceSameOrigin(request);
  if (originError) return originError;
  const parsed = await readJsonBody<{ kitab?: string }>(request, MAX_DELETE_BYTES);
  if ("response" in parsed) return parsed.response;
  const body = parsed.data;
  if (typeof body.kitab !== "string" || !getBookTaxonomy(body.kitab)) return NextResponse.json({ error: "Kitab tidak valid." }, { status: 400 });
  const { error } = await getSupabaseAdmin().from("book_backgrounds").delete().eq("kitab", body.kitab);
  if (error) {
    console.error("Background delete failed", { code: error.code });
    return serverError("Gagal menghapus latar belakang.");
  }
  revalidatePath("/");
  revalidatePath(`/kitab/${body.kitab}`);
  revalidatePath(`/latar-belakang/${body.kitab}`);
  revalidatePath("/latar-belakang");
  revalidatePath("/sitemap.xml");
  return NextResponse.json({ ok: true });
}
