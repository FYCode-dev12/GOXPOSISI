import Link from "next/link";
import { Search } from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[color:var(--surface-strong)] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-2.5 text-[var(--foreground)]">
          <span className="truncate text-base font-black tracking-[0.08em] text-[var(--foreground)] sm:text-lg">GOXPOSISI</span>
        </Link>
        <nav className="flex items-center gap-1.5 text-sm text-[var(--muted)] sm:gap-2" aria-label="Navigasi utama">
          <Link href="/" aria-current="page" className="rounded-lg bg-[var(--accent-soft)] px-3 py-2 font-semibold text-[var(--foreground)] transition hover:text-[var(--accent)]">Kitab</Link>
          <Link href="/tema" className="rounded-lg px-2 py-2 transition hover:bg-[var(--accent-soft)] hover:text-[var(--foreground)] sm:px-3">Tema</Link>
          <Link href="/cari" className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 transition hover:bg-[var(--accent-soft)] hover:text-[var(--foreground)] sm:px-3">
            <Search className="h-4 w-4" /><span className="hidden sm:inline">Cari</span>
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
