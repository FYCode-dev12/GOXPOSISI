"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

type ThemeMode = "system" | "light" | "dark";
const STORAGE_KEY = "goxposisi-theme";

function applyTheme(mode: ThemeMode, systemDark: boolean) {
  const root = document.documentElement;
  const dark = mode === "dark" || (mode === "system" && systemDark);
  root.classList.toggle("dark", dark);
  root.classList.toggle("light", !dark && mode !== "system");
  root.style.colorScheme = dark ? "dark" : "light";
}

export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>("system");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === "system" || saved === "light" || saved === "dark") setMode(saved);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => applyTheme(mode, media.matches);
    sync();
    const onChange = () => {
      if (mode === "system") sync();
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [mode]);

  function setTheme(next: ThemeMode) {
    setMode(next);
    window.localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next, window.matchMedia("(prefers-color-scheme: dark)").matches);
  }

  function toggleTheme() {
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const next: ThemeMode = mode === "system"
      ? systemDark ? "light" : "dark"
      : mode === "light"
        ? systemDark ? "dark" : "system"
        : systemDark ? "system" : "light";
    setTheme(next);
  }

  const label = mode === "system"
    ? "Tema mengikuti pengaturan sistem. Klik untuk mengganti tema manual."
    : mode === "dark"
      ? "Mode gelap manual. Klik untuk kembali ke tema sistem."
      : "Mode terang manual. Klik untuk mengganti ke mode gelap.";

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
