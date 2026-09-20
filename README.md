# GOXPOSISI

Platform artikel eksposisi Alkitab pasal demi pasal. Konten ditulis dalam MDX dan dibangun sebagai halaman statis menggunakan Next.js.

## Menjalankan lokal

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`.

## Pemeriksaan sebelum deploy

```bash
npx tsc --noEmit
npm run lint
npm run build
```

## Environment variable

Buat `.env.local` untuk lokal atau isi Environment Variables di platform deployment:

```env
NEXT_PUBLIC_SITE_URL=https://domain-kamu.com
```

Nilai ini digunakan oleh metadata, sitemap, dan robots. Gunakan URL HTTPS produksi tanpa slash di bagian akhir.

## Struktur konten

Setiap kitab yang sudah memiliki artikel memiliki struktur berikut:

```text
content/
└── roma/
    ├── meta.json
    └── pasal-1.mdx
```

Contoh `meta.json`:

```json
{
  "name": "Roma",
  "testament": "PB",
  "order": 45,
  "totalPasal": 16
}
```

Contoh frontmatter MDX:

```md
---
title: "Roma 1 — Kebenaran yang Dinyatakan"
kitab: roma
pasal: 1
author: "Nama Penulis"
date: 2026-09-01
summary: "Ringkasan artikel."
tags: ["roma", "injil"]
---

Isi eksposisi dalam Markdown/MDX.
```

Slug folder kitab harus sesuai dengan taksonomi pada `src/lib/books-taxonomy.ts`. Build akan gagal dengan pesan yang jelas apabila metadata kitab atau frontmatter artikel tidak valid.

## Fitur

- Navigasi kitab, pasal, dan tema
- Pencarian artikel
- MDX untuk artikel eksposisi
- Dark mode dan light mode
- Responsive glassmorphism UI
- Text-to-speech menggunakan Web Speech API browser
- Metadata SEO, sitemap, dan robots

## Deploy ke Vercel

1. Import repository ke Vercel.
2. Set `NEXT_PUBLIC_SITE_URL` ke domain produksi.
3. Deploy.
4. Periksa halaman utama, artikel, pencarian, tema, `/robots.txt`, dan `/sitemap.xml`.
5. Jalankan pemeriksaan build lokal sebelum setiap deploy.

Text-to-speech tidak memerlukan API key. Ketersediaan suara bergantung pada browser dan sistem operasi pengunjung.
