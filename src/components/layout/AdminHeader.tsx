"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Upload, FileText } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

const links = [
  { href: "/admin/articles", label: "Artikel", icon: FileText },
  { href: "/admin/upload", label: "Upload", icon: Upload },
];

export function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();
  async function logout() {
    await createSupabaseBrowserClient().auth.signOut();
    router.push("/admin/login");
  }
  return <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[color:var(--surface-strong)] backdrop-blur-xl"><div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8"><Link href="/admin/articles" className="text-base font-black tracking-[0.08em] text-[var(--foreground)]">GOXPOSISI <span className="font-normal tracking-normal text-[var(--muted)]">Admin</span></Link><nav className="flex items-center gap-1 text-sm" aria-label="Navigasi admin">{links.map(({ href, label, icon: Icon }) => { const active = pathname === href || pathname.startsWith(`${href}/`); return <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`flex items-center gap-1.5 rounded-lg px-2 py-2 transition sm:px-3 ${active ? "bg-[var(--accent-soft)] font-semibold text-[var(--foreground)]" : "text-[var(--muted)] hover:bg-[var(--accent-soft)] hover:text-[var(--foreground)]"}`}><Icon className="h-4 w-4" /><span className="hidden sm:inline">{label}</span></Link>; })}<ThemeToggle /><button type="button" onClick={logout} title="Keluar" aria-label="Keluar dari admin" className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--accent-soft)] hover:text-[var(--foreground)]"><LogOut className="h-4 w-4" /></button></nav></div></header>;
}
