import Link from "next/link";
import type { Metadata } from "next";
import { getAllTags } from "@/lib/content";

export const metadata: Metadata = {
  title: "Tema",
  description: "Jelajahi artikel eksposisi Alkitab berdasarkan tema.",
};

export default function TemaPage() {
  const tags = getAllTags();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Tema
      </h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-300">
        Jelajahi artikel eksposisi berdasarkan tema atau topik.
      </p>

      {tags.length === 0 ? (
        <p className="mt-8 text-zinc-500 dark:text-zinc-400">
          Belum ada tema yang tersedia.
        </p>
      ) : (
        <div className="mt-8 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Link
              key={tag}
              href={`/tema/${tag}`}
              className="rounded-full bg-zinc-100 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
            >
              #{tag}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
