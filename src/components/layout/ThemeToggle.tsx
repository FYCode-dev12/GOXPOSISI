"use client";

import { Monitor } from "lucide-react";
import { useEffect } from "react";

export function ThemeToggle() {
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const applySystemTheme = (event?: MediaQueryListEvent) => {
      document.documentElement.classList.toggle("dark", event?.matches ?? media.matches);
    };

    applySystemTheme();
    media.addEventListener("change", applySystemTheme);
    return () => media.removeEventListener("change", applySystemTheme);
  }, []);

  return (
    <span
      title="Tema mengikuti pengaturan sistem"
      aria-label="Tema mengikuti pengaturan sistem"
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] text-[var(--muted)]"
    >
      <Monitor className="h-4 w-4" aria-hidden="true" />
    </span>
  );
}
