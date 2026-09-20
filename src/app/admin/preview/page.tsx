import { MDXRemote } from "next-mdx-remote/rsc";

export default async function AdminPreviewPage({ searchParams }: { searchParams: Promise<{ content?: string }> }) {
  const { content = "" } = await searchParams;
  return <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6"><div className="glass-panel prose-article rounded-2xl p-6 font-serif text-[var(--foreground)] sm:p-10"><MDXRemote source={content} /></div></main>;
}
