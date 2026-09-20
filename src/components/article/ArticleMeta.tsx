import Link from "next/link";
import type { ArticleFrontmatter } from "@/types/content";

function formatDate(dateStr: string): string {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

export function ArticleMeta({
  frontmatter,
}: {
  frontmatter: ArticleFrontmatter;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-zinc-200 pb-6 dark:border-zinc-800">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-500 dark:text-zinc-400">
        <span>Oleh {frontmatter.author}</span>
        <span aria-hidden>&middot;</span>
        <time dateTime={frontmatter.date}>
          {formatDate(frontmatter.date)}
        </time>
      </div>

      {frontmatter.tags && frontmatter.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {frontmatter.tags.map((tag) => (
            <Link
              key={tag}
              href={`/tema/${tag}`}
              className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              #{tag}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
