export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-zinc-200 py-8 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
      <p>&copy; {year} Eksposisi Alkitab. Ditulis oleh Dion.</p>
    </footer>
  );
}
