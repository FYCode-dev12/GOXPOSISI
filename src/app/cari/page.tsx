import type { Metadata } from "next";
import { buildSearchIndex } from "@/lib/search";
import { SearchBox } from "@/components/search/SearchBox";

export const metadata: Metadata = {
  title: "Cari",
  description: "Cari artikel eksposisi Alkitab berdasarkan judul atau isi.",
};

export default function CariPage() {
  const data = buildSearchIndex();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Cari
      </h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-300">
        Cari berdasarkan judul, tema, atau isi artikel.
      </p>

      <div className="mt-6">
        <SearchBox data={data} />
      </div>
    </div>
  );
}
