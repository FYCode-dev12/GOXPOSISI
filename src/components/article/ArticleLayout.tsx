import type { ReactNode } from "react";

export function ArticleLayout({ children }: { children: ReactNode }) {
  return (
    <article className="prose-article glass-panel mx-auto w-full max-w-[70ch] rounded-2xl px-5 py-8 font-serif text-[1.0625rem] leading-[1.85] text-[var(--foreground)] sm:px-10 sm:py-12">
      {children}
    </article>
  );
}
