"use client";

import { Pause, Play, Square, Volume2 } from "lucide-react";
import { useEffect, useState } from "react";

export function ArticleAudio({ text }: { text: string }) {
  const [status, setStatus] = useState<"idle" | "playing" | "paused">("idle");

  useEffect(() => {
    return () => window.speechSynthesis?.cancel();
  }, []);

  function speak() {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "id-ID";
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.onstart = () => setStatus("playing");
    utterance.onend = () => setStatus("idle");
    utterance.onerror = () => setStatus("idle");
    window.speechSynthesis.speak(utterance);
  }

  function togglePause() {
    if (status === "playing") {
      window.speechSynthesis.pause();
      setStatus("paused");
    } else if (status === "paused") {
      window.speechSynthesis.resume();
      setStatus("playing");
    }
  }

  function stop() {
    window.speechSynthesis.cancel();
    setStatus("idle");
  }

  return (
    <div className="audio-player" aria-label="Pemutar audio artikel">
      <div className="flex min-w-0 items-center gap-3">
        <span className="audio-player__icon" aria-hidden="true">
          <Volume2 className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[var(--foreground)]">Dengarkan artikel</p>
          <p className="truncate text-xs text-[var(--muted)]">Text to speech · Bahasa Indonesia</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <button type="button" onClick={status === "idle" ? speak : togglePause} className="audio-player__button audio-player__button--primary" aria-label={status === "idle" ? "Putar artikel" : status === "playing" ? "Jeda audio" : "Lanjutkan audio"}>
          {status === "playing" ? <Pause className="h-4 w-4" /> : status === "paused" ? <Play className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>
        {status !== "idle" && (
          <button type="button" onClick={stop} className="audio-player__button" aria-label="Hentikan audio">
            <Square className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
