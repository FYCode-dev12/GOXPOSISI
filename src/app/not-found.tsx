import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[55vh] w-full max-w-2xl items-center justify-center px-4 py-16 text-center sm:px-6">
      <div className="glass-panel w-full rounded-3xl px-6 py-12 sm:px-12">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--accent)]">404</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl">Halaman tidak ditemukan</h1>
        <p className="mx-auto mt-4 max-w-md leading-relaxed text-[var(--muted)]">Halaman yang kamu cari belum tersedia atau alamatnya sudah berubah.</p>
        <Link href="/" className="mt-8 inline-flex rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 dark:text-[#071321]">Kembali ke beranda</Link>
      </div>
    </div>
  );
}
