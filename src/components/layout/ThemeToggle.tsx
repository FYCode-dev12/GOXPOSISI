"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

type ThemeMode = "system" | "light" | "dark";

export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>("system");

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const applySystemTheme = (event?: MediaQueryListEvent) => {
      if (mode !== "system") return;
      document.documentElement.classList.toggle("dark", event?.matches ?? media.matches);
    };

    applySystemTheme();
    media.addEventListener("change", applySystemTheme);
    return () => media.removeEventListener("change", applySystemTheme);
  }, [mode]);

  function toggleTheme() {
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const currentDark = mode === "dark" || (mode === "system" && systemDark);
    const next: ThemeMode = currentDark ? "light" : "dark";
    setMode(next);
    document.documentElement.classList.toggle("dark", next === "dark");
  }

  const label = mode === "system"
    ? "Tema mengikuti pengaturan sistem. Klik untuk mengganti tema manual."
    : `Mode ${mode === "dark" ? "gelap" : "terang"}. Klik untuk mengganti tema.`;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={label}
      aria-label={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] text-[var(--muted)] transition hover:bg-[var(--accent-soft)] hover:text-[var(--foreground)]"
    >
      {mode === "system" ? <Monitor className="h-4 w-4" aria-hidden="true" /> : mode === "dark" ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
    </button>
  );
}
