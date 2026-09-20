"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/admin` },
      });
      if (error) throw error;
      setMessage("Magic link sudah dikirim. Periksa email admin.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Login gagal.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-md items-center px-4 py-16">
      <form onSubmit={submit} className="glass-panel w-full rounded-3xl p-6 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent)]">GOXPOSISI Admin</p>
        <h1 className="mt-3 text-3xl font-semibold text-[var(--foreground)]">Masuk admin</h1>
        <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">Gunakan email admin untuk menerima magic link.</p>
        <label className="mt-6 block text-sm font-medium text-[var(--foreground)]">Email</label>
        <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3 text-[var(--foreground)] outline-none focus:border-[var(--accent)]" />
        <button disabled={loading} className="mt-5 w-full rounded-xl bg-[var(--primary)] px-4 py-3 font-semibold text-white disabled:opacity-60 dark:text-[#071321]">{loading ? "Mengirim..." : "Kirim magic link"}</button>
        {message && <p className="mt-4 text-sm text-[var(--muted)]">{message}</p>}
      </form>
    </main>
  );
}
