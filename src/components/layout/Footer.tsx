import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-zinc-200 py-8 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
      <p>&copy; {year} GOXPOSISI. Ditulis oleh Dion.</p>
      <Link href="/disclaimer" className="mt-2 inline-block underline-offset-4 hover:text-[var(--accent)] hover:underline">
        Disclaimer pelayanan
      </Link>
    </footer>
  );
}
