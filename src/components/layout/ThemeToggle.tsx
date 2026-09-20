"use client";

import { Monitor } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const applySystemTheme = (event?: MediaQueryListEvent) => {
      const dark = event?.matches ?? media.matches;
      setIsDark(dark);
      document.documentElement.classList.toggle("dark", dark);
    };

    applySystemTheme();
    media.addEventListener("change", applySystemTheme);
    return () => media.removeEventListener("change", applySystemTheme);
  }, []);

  return (
    <span
      title={`Mengikuti mode ${isDark ? "gelap" : "terang"} sistem`}
      aria-label={`Mode ${isDark ? "gelap" : "terang"}, mengikuti pengaturan sistem`}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] text-[var(--muted)]"
    >
      <Monitor className="h-4 w-4" />
    </span>
  );
}
