"use client";

import { useState } from "react";
import { BOOKS_TAXONOMY } from "@/lib/books-taxonomy";

type UploadMode = "article" | "background";

function openPreview(content: string) {
  const markdown = content.replace(/^---[\s\S]*?---/, "");
  window.open(`/admin/preview?content=${encodeURIComponent(markdown)}`, "goxposisi-preview", "noopener,noreferrer");
}

export default function AdminUploadPage() {
  const [mode, setMode] = useState<UploadMode>("article");
  const [selectedBook, setSelectedBook] = useState("roma");
  const [raw, setRaw] = useState("");
  const [message, setMessage] = useState("");
  const [dragging, setDragging] = useState(false);
  const [saving, setSaving] = useState(false);

  function loadFile(file?: File) {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".md")) {
      setMessage("Hanya file .md yang diterima.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setRaw(String(reader.result ?? ""));
    reader.readAsText(file);
  }

  async function submit() {
    if (!raw.trim()) return;
    setSaving(true);
    setMessage(mode === "article" ? "Memvalidasi dan menerbitkan artikel..." : "Menyimpan latar belakang kitab...");
    const endpoint = mode === "article" ? "/api/admin/upload" : "/api/admin/backgrounds";
    const body = mode === "article" ? { content: raw, publish: true } : { kitab: selectedBook, content: raw };
    try {
      const response = await fetch(endpoint, { method: mode === "article" ? "POST" : "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      const result = await response.json();
      setMessage(response.ok ? (mode === "article" ? "Artikel berhasil diterbitkan." : "Latar belakang kitab berhasil disimpan.") : result.error ?? "Upload gagal.");
    } catch {
      setMessage("Tidak dapat terhubung ke server.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mb-8"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent)]">GOXPOSISI Admin</p><h1 className="mt-3 text-3xl font-semibold text-[var(--foreground)]">Upload konten</h1><p className="mt-2 max-w-2xl text-[var(--muted)]">Kelola artikel pasal dan latar belakang kitab dari satu tempat menggunakan Markdown.</p></div>
      <div className="mb-6 grid gap-3 sm:grid-cols-2" role="tablist" aria-label="Tipe konten">
        <button type="button" role="tab" aria-selected={mode === "article"} onClick={() => { setMode("article"); setMessage(""); }} className={`rounded-2xl border p-4 text-left transition ${mode === "article" ? "border-[var(--accent)] bg-[var(--accent-soft)]" : "border-[var(--border)] bg-[var(--surface)]"}`}><span className="font-semibold text-[var(--foreground)]">Artikel pasal</span><span className="mt-1 block text-sm text-[var(--muted)]">Upload eksposisi dengan frontmatter Markdown.</span></button>
        <button type="button" role="tab" aria-selected={mode === "background"} onClick={() => { setMode("background"); setMessage(""); }} className={`rounded-2xl border p-4 text-left transition ${mode === "background" ? "border-[var(--accent)] bg-[var(--accent-soft)]" : "border-[var(--border)] bg-[var(--surface)]"}`}><span className="font-semibold text-[var(--foreground)]">Latar belakang kitab</span><span className="mt-1 block text-sm text-[var(--muted)]">Upload konteks kitab sebelum pembahasan pasal.</span></button>
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(20rem,.8fr)]">
        <section className="glass-panel rounded-3xl p-5 sm:p-7">
          {mode === "background" && <div className="mb-5"><label className="block text-sm font-semibold text-[var(--foreground)]" htmlFor="book">Kitab tujuan</label><select id="book" value={selectedBook} onChange={(event) => setSelectedBook(event.target.value)} className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3 text-[var(--foreground)] outline-none focus:border-[var(--accent)]">{BOOKS_TAXONOMY.map((book) => <option key={book.slug} value={book.slug}>{book.name} · {book.testament === "PL" ? "Perjanjian Lama" : "Perjanjian Baru"}</option>)}</select></div>}
          <label onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); loadFile(event.dataTransfer.files[0]); }} className={`flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition ${dragging ? "border-[var(--accent)] bg-[var(--accent-soft)]" : "border-[var(--border)]"}`}><span className="font-semibold text-[var(--foreground)]">Tarik file .md ke sini</span><span className="mt-2 text-sm text-[var(--muted)]">atau klik untuk memilih file</span><input type="file" accept=".md,text/markdown" className="sr-only" onChange={(event) => loadFile(event.target.files?.[0])} /></label>
          <textarea value={raw} onChange={(event) => setRaw(event.target.value)} placeholder={mode === "article" ? "Atau tempel artikel Markdown lengkap dengan frontmatter..." : "Atau tempel isi latar belakang dalam Markdown..."} className="mt-5 min-h-72 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] p-4 font-mono text-sm leading-6 text-[var(--foreground)] outline-none focus:border-[var(--accent)]" />
          <div className="flex flex-wrap items-center gap-3"><button disabled={!raw.trim() || saving} onClick={submit} className="rounded-xl bg-[var(--primary)] px-5 py-3 font-semibold text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-50 dark:text-[#071321]">{saving ? "Menyimpan..." : mode === "article" ? "Publish artikel" : "Simpan latar belakang"}</button>{message && <p role="status" className="text-sm text-[var(--muted)]">{message}</p>}</div>
        </section>
        <section className="glass-panel rounded-3xl p-5 sm:p-7"><h2 className="text-lg font-semibold text-[var(--foreground)]">Preview Markdown</h2><p className="mt-2 text-sm leading-6 text-[var(--muted)]">Periksa hasil render sebelum menyimpan konten.</p>{raw ? <button type="button" onClick={() => openPreview(raw)} className="mt-5 rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white dark:text-[#071321]">Buka preview</button> : <p className="mt-5 rounded-xl border border-dashed border-[var(--border)] p-5 text-sm text-[var(--muted)]">Preview tersedia setelah file dipilih atau teks ditempel.</p>}</section>
      </div>
    </main>
  );
}
