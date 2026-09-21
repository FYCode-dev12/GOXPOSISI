"use client";

import { useState } from "react";

function openPreview(content: string) {
  const url = `/admin/preview?content=${encodeURIComponent(content.replace(/^---[\\s\\S]*?---/, ""))}`;
  window.open(url, "goxposisi-preview", "noopener,noreferrer");
}

export default function AdminUploadPage() {
  const [raw, setRaw] = useState("");
  const [message, setMessage] = useState("");
  const [dragging, setDragging] = useState(false);

  function loadFile(file?: File) {
    if (!file) return;
    if (!file.name.endsWith(".md")) { setMessage("Hanya file .md yang diterima."); return; }
    const reader = new FileReader();
    reader.onload = () => setRaw(String(reader.result ?? ""));
    reader.readAsText(file);
  }

  async function publish() {
    setMessage("Memvalidasi dan menerbitkan...");
    const response = await fetch("/api/admin/upload", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ content: raw, publish: true }) });
    const result = await response.json();
    setMessage(response.ok ? "Artikel berhasil diterbitkan." : result.error ?? "Gagal menerbitkan artikel.");
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent)]">GOXPOSISI Admin</p><h1 className="mt-3 text-3xl font-semibold text-[var(--foreground)]">Upload artikel</h1><p className="mt-2 text-[var(--muted)]">Unggah Markdown, periksa preview, lalu publish ke Supabase.</p></div>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="glass-panel rounded-2xl p-5">
          <label onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(e) => { e.preventDefault(); setDragging(false); loadFile(e.dataTransfer.files[0]); }} className={`flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition ${dragging ? "border-[var(--accent)] bg-[var(--accent-soft)]" : "border-[var(--border)]"}`}><span className="font-semibold text-[var(--foreground)]">Tarik file .md ke sini</span><span className="mt-2 text-sm text-[var(--muted)]">atau klik untuk memilih file</span><input type="file" accept=".md,text/markdown" className="sr-only" onChange={(e) => loadFile(e.target.files?.[0])} /></label>
          <textarea value={raw} onChange={(e) => setRaw(e.target.value)} placeholder="Atau tempel isi Markdown di sini..." className="mt-5 min-h-72 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-strong)] p-4 font-mono text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)]" />
          <button disabled={!raw.trim()} onClick={publish} className="mt-4 rounded-xl bg-[var(--primary)] px-5 py-3 font-semibold text-white disabled:opacity-50 dark:text-[#071321]">Publish artikel</button>
          {message && <p className="mt-4 text-sm text-[var(--muted)]">{message}</p>}
        </section>
        <section className="glass-panel rounded-2xl p-5"><h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">Preview</h2>{raw ? <button type="button" onClick={() => openPreview(raw)} className="rounded-xl bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white dark:text-[#071321]">Buka preview render MDX</button> : <p className="text-sm text-[var(--muted)]">Preview akan tampil setelah file dipilih.</p>}</section>
      </div>
    </main>
  );
}
