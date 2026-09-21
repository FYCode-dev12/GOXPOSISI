"use client";

import Link from "next/link";
import { useState } from "react";
import { X } from "lucide-react";

export function DisclaimerModal() {
  const [open, setOpen] = useState(true);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="disclaimer-title">
      <div className="glass-panel max-h-[min(42rem,90vh)] w-full max-w-xl overflow-y-auto rounded-3xl p-6 shadow-2xl sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent)]">Sebelum membaca</p>
            <h2 id="disclaimer-title" className="mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)]">Catatan pelayanan</h2>
          </div>
          <button type="button" onClick={() => setOpen(false)} aria-label="Tutup disclaimer" className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[var(--border)] text-[var(--muted)] transition hover:bg-[var(--accent-soft)] hover:text-[var(--foreground)]">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-5 space-y-4 text-sm leading-7 text-[var(--muted)] sm:text-base">
          <p>GOXPOSISI adalah proyek pelayanan digital independen yang dikelola secara pribadi sebagai bentuk kecintaan terhadap Firman Tuhan dan upaya membagikan sudut pandang yang berpusat pada Injil.</p>
          <p>Seluruh tulisan merupakan hasil studi pribadi, refleksi autodidak, serta buah dari diskusi dan pembimbingan bersama pembimbing rohani. Tulisan di website ini bukan pengganti kehadiran fisik, penggembalaan, konseling pastoral, disiplin gereja, atau pelayanan sakramen dalam gereja lokal.</p>
          <p>Untuk pergumulan berat, pertanyaan doktrinal mendalam, atau keputusan besar, bawalah kepada gembala, penatua, atau pemimpin rohani di gereja lokal tempat Anda beribadah.</p>
        </div>
        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
          <Link href="/disclaimer" className="rounded-xl px-4 py-2.5 text-center text-sm font-medium text-[var(--muted)] transition hover:bg-[var(--accent-soft)] hover:text-[var(--foreground)]">Baca selengkapnya</Link>
          <button type="button" onClick={() => setOpen(false)} className="rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 dark:text-slate-950">Saya mengerti</button>
        </div>
      </div>
    </div>
  );
}
