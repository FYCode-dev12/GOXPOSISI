import Link from "next/link";
import { redirect } from "next/navigation";
import { BookOpen, FileText, Upload } from "lucide-react";
import { getAllBooksWithBackgrounds, getAllBooksWithContent } from "@/lib/content";

export default async function AdminPage() {
  let articleBooks = 0;
  let articleCount = 0;
  let backgroundCount = 0;

  try {
    const [books, backgrounds] = await Promise.all([getAllBooksWithContent(), getAllBooksWithBackgrounds()]);
    articleBooks = books.length;
    articleCount = books.reduce((total, book) => total + book.availablePasal.length, 0);
    backgroundCount = backgrounds.length;
  } catch {
    redirect("/admin/login");
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <header className="border-b border-[var(--border)] pb-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent)]">GOXPOSISI Admin</p>
        <h1 className="mt-2 text-3xl font-semibold text-[var(--foreground)]">Dashboard CMS</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">Kelola artikel eksposisi dan latar belakang kitab dari satu tempat.</p>
      </header>

      <section className="mt-7 grid gap-4 sm:grid-cols-3" aria-label="Ringkasan konten">
        <div className="border-l-2 border-[var(--accent)] pl-4"><p className="text-xs font-semibold uppercase text-[var(--muted)]">Artikel pasal</p><p className="mt-1 text-2xl font-semibold text-[var(--foreground)]">{articleCount}</p><p className="text-sm text-[var(--muted)]">di {articleBooks} kitab</p></div>
        <div className="border-l-2 border-[var(--primary)] pl-4"><p className="text-xs font-semibold uppercase text-[var(--muted)]">Latar belakang</p><p className="mt-1 text-2xl font-semibold text-[var(--foreground)]">{backgroundCount}</p><p className="text-sm text-[var(--muted)]">dari 66 kitab</p></div>
        <div className="flex items-end"><Link href="/admin/upload" className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white dark:text-[#071321]"><Upload aria-hidden="true" size={16} />Upload konten</Link></div>
      </section>

      <section className="mt-10 grid gap-8 md:grid-cols-2">
        <article className="border-t-2 border-[var(--accent)] pt-5">
          <div className="flex items-start gap-3"><FileText aria-hidden="true" className="mt-1 text-[var(--accent)]" size={20} /><div><h2 className="text-xl font-semibold text-[var(--foreground)]">Artikel eksposisi</h2><p className="mt-1 text-sm leading-6 text-[var(--muted)]">Kelola artikel berdasarkan kitab dan pasal, periksa status publikasi, dan susun materi eksposisi.</p></div></div>
          <div className="mt-5 flex flex-wrap gap-2"><Link href="/admin/articles" className="rounded-lg border border-[var(--border)] px-4 py-2.5 text-sm font-semibold text-[var(--foreground)]">Kelola artikel</Link><Link href="/admin/upload" className="rounded-lg border border-[var(--border)] px-4 py-2.5 text-sm font-semibold text-[var(--foreground)]">Tambah artikel</Link></div>
        </article>
        <article className="border-t-2 border-[var(--primary)] pt-5">
          <div className="flex items-start gap-3"><BookOpen aria-hidden="true" className="mt-1 text-[var(--primary)]" size={20} /><div><h2 className="text-xl font-semibold text-[var(--foreground)]">Latar belakang kitab</h2><p className="mt-1 text-sm leading-6 text-[var(--muted)]">Kelola pengantar, konteks sejarah, penulis, dan tujuan setiap kitab. Konten yang tersedia dapat dibaca di halaman publik.</p></div></div>
          <div className="mt-5 flex flex-wrap gap-2"><Link href="/admin/backgrounds" className="rounded-lg border border-[var(--border)] px-4 py-2.5 text-sm font-semibold text-[var(--foreground)]">Kelola latar belakang</Link><Link href="/latar-belakang" className="rounded-lg border border-[var(--border)] px-4 py-2.5 text-sm font-semibold text-[var(--foreground)]">Lihat halaman publik</Link></div>
        </article>
      </section>
    </main>
  );
}
