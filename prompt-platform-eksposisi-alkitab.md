# Platform Eksposisi Alkitab

Kamu adalah agent developer yang membangun **"Platform Eksposisi Alkitab"** —
website untuk memuat tulisan eksposisi Alkitab pasal per pasal, dimulai
dari Kitab Roma dan akan berkembang mencakup kitab-kitab lain.

## Tujuan Proyek

- Website untuk artikel eksposisi Alkitab, mudah dibaca, gratis untuk di-host.
- Struktur konten: **Kitab > Pasal > Artikel eksposisi** (judul, ringkasan,
  konteks historis, isi eksposisi, aplikasi praktis).
- Mulai dari Roma pasal 1, lalu bertambah ke kitab lain seiring waktu —
  jadi struktur harus rapi dari awal, bukan cuma cukup untuk satu kitab.
- **Platform pribadi**: untuk saat ini penulisnya hanya satu orang (saya
  sendiri). Tidak perlu sistem akun/login sama sekali di tahap ini.
  Tapi siapkan strukturnya supaya mudah dikembangkan ke multi-penulis
  di kemudian hari (lihat bagian "Siap untuk berkembang" di bawah).

## Tech Stack

- **Next.js** (App Router) + **Tailwind CSS**
- Konten artikel dalam format **MDX/Markdown**, disimpan di folder
  `/content` — bukan database, supaya mudah ditulis dan gratis di-hosting
- Deploy gratis di **Vercel**, repo di **GitHub**
- Search: mulai dengan library ringan (mis. FlexSearch/Fuse.js) yang
  jalan di client. Kalau jumlah artikel sudah mencakup banyak kitab
  (ratusan–ribuan halaman), migrasi ke **Pagefind** — alat pencarian
  statis gratis yang dibuat khusus untuk situs besar tanpa server.

## Struktur Konten

```
/content
  /roma
    pasal-1.mdx
    pasal-2.mdx
    meta.json      (nama kitab, Perjanjian Lama/Baru, urutan, jumlah pasal)
  /matius
    pasal-1.mdx
    ...
```

Setiap file artikel memakai frontmatter seperti ini, termasuk field
`author` sejak awal (walau isinya selalu nama saya untuk sekarang):

```
---
title: "Roma 1 — Kebenaran yang Dinyatakan"
kitab: roma
pasal: 1
author: "Yoel"
date: 2026-09-01
---
```

## Navigasi

- Dikelompokkan, bukan daftar datar: Perjanjian Lama (Taurat, Sejarah,
  Puisi, Nabi) dan Perjanjian Baru (Injil, Surat, dst).
- Ini penting supaya saat jumlah kitab bertambah, pembaca tidak perlu
  scroll ratusan judul dalam satu daftar.

## Fitur Wajib

1. Halaman daftar kitab & pasal (navigasi hierarkis)
2. Halaman artikel per pasal, tipografi nyaman baca teks panjang
   (max-width terbatas, line-height lega, font serif untuk isi)
3. Kategori/tag (mis. per kitab, per tema)
4. Pencarian judul & isi artikel
5. Mode gelap/terang (toggle, tersimpan di localStorage)
6. Responsif penuh di HP
7. SEO dasar (meta title/description per artikel)

## Siap untuk Berkembang (tanpa dikerjakan sekarang)

- Field `author` di setiap artikel (sudah termasuk di atas)
- Folder `/content` dipisah total dari folder kode — kalau nanti pindah
  ke headless CMS (mis. Sanity/Contentful versi gratis) supaya orang
  lain bisa menulis lewat dashboard, yang diganti cukup sumber datanya,
  tampilan halaman tidak perlu dibongkar
- Jangan bangun sistem login/akun sekarang — cukup disiapkan strukturnya
  agar mudah ditambahkan nanti, tidak perlu dikerjakan di tahap ini

## Cara Kerja

- Kerjakan bertahap: rencana struktur folder & halaman dulu, baru
  komponen, baru styling, baru fitur (search, dark mode).
- Setiap selesai satu tahap, jelaskan singkat apa yang barusan dibuat
  dan kenapa, lalu tunggu saya bilang **"lanjut"** untuk tahap berikutnya.
- Jangan berhenti minta konfirmasi kecuali keputusan itu memang butuh
  saya (misal: nama domain, warna tema, atau isi teologis artikel).
- Artikel pertama yang jadi contoh: eksposisi Roma pasal 1 (boleh pakai
  draf placeholder dulu kalau saya belum kirim naskahnya).

Mulai dari langkah 1: usulkan struktur folder proyek Next.js-nya.
