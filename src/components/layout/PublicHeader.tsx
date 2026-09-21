"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

const links = [
  { href: "/", label: "Kitab" },
  { href: "/tema", label: "Tema" },
];

export function PublicHeader() {
  const pathname = usePathname();
  return <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[color:var(--surface-strong)] backdrop-blur-xl"><div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8"><Link href="/" className="text-base font-black tracking-[0.08em] text-[var(--foreground)] sm:text-lg">GOXPOSISI</Link><nav className="flex items-center gap-1 text-sm" aria-label="Navigasi utama">{links.map(({ href, label }) => { const active = href === "/" ? pathname === "/" || pathname.startsWith("/kitab") : pathname === href || pathname.startsWith(`${href}/`); return <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`rounded-lg px-2 py-2 transition sm:px-3 ${active ? "bg-[var(--accent-soft)] font-semibold text-[var(--foreground)]" : "text-[var(--muted)] hover:bg-[var(--accent-soft)] hover:text-[var(--foreground)]"}`}>{label}</Link>; })}<Link href="/cari" aria-current={pathname.startsWith("/cari") ? "page" : undefined} className={`flex items-center gap-1.5 rounded-lg px-2.5 py-2 transition sm:px-3 ${pathname.startsWith("/cari") ? "bg-[var(--accent-soft)] font-semibold text-[var(--foreground)]" : "text-[var(--muted)] hover:bg-[var(--accent-soft)] hover:text-[var(--foreground)]"}`}><Search className="h-4 w-4" /><span className="hidden sm:inline">Cari</span></Link><ThemeToggle /></nav></div></header>;
}
