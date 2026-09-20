"use client";

import { Pause, Play, Square, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type AudioStatus = "idle" | "playing" | "paused" | "error";
function splitSpeechText(text: string): string[] {
  const normalized = text.replace(/\bAllah\b/g, "Al-lah").replace(/\s+/g, " ").trim();
  const sentences = normalized.match(/.{1,180}(?:\s|$)/g) ?? [];
  return sentences.map((chunk) => chunk.trim()).filter(Boolean);
}

export function ArticleAudio({ text }: { text: string }) {
  const [status, setStatus] = useState<AudioStatus>("idle");
  const chunksRef = useRef<string[]>([]);
  const indexRef = useRef(0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
      utteranceRef.current = null;
    };
  }, []);

  function finish() {
    utteranceRef.current = null;
    setStatus("idle");
  }

  function speakChunk() {
    const synthesis = window.speechSynthesis;
    const chunk = chunksRef.current[indexRef.current];
    if (!chunk) {
      finish();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(chunk);
    utteranceRef.current = utterance;
    utterance.lang = "id-ID";
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.onstart = () => setStatus("playing");
    utterance.onend = () => {
      indexRef.current += 1;
      window.setTimeout(speakChunk, 0);
    };
    utterance.onerror = (event) => {
      if (event.error === "canceled" || event.error === "interrupted") return;
      utteranceRef.current = null;
      setStatus("error");
    };
    synthesis.speak(utterance);
  }

  function speak() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setStatus("error");
      return;
    }

    const chunks = splitSpeechText(text);
    if (chunks.length === 0) {
      setStatus("error");
      return;
    }

    window.speechSynthesis.cancel();
    chunksRef.current = chunks;
    indexRef.current = 0;
    window.setTimeout(speakChunk, 0);
  }

  function togglePause() {
    if (typeof window === "undefined") return;
    if (status === "playing") {
      window.speechSynthesis.pause();
      setStatus("paused");
    } else if (status === "paused") {
      window.speechSynthesis.resume();
      setStatus("playing");
    }
  }

  function stop() {
    window.speechSynthesis?.cancel();
    utteranceRef.current = null;
    chunksRef.current = [];
    indexRef.current = 0;
    setStatus("idle");
  }

  const isActive = status === "playing" || status === "paused";

  return (
    <div className="audio-player" aria-label="Pemutar audio artikel">
      <div className="flex min-w-0 items-center gap-3">
        <span className="audio-player__icon" aria-hidden="true"><Volume2 className="h-4 w-4" /></span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[var(--foreground)]">Dengarkan artikel</p>
          <p className="truncate text-xs text-[var(--muted)]">
            {status === "error" ? "Audio gagal dimulai — coba lagi" : "Text to speech · Bahasa Indonesia"}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <button type="button" onClick={isActive ? togglePause : speak} className="audio-player__button audio-player__button--primary" aria-label={status === "playing" ? "Jeda audio" : status === "paused" ? "Lanjutkan audio" : "Putar artikel"}>
          {status === "playing" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>
        {isActive && (
          <button type="button" onClick={stop} className="audio-player__button" aria-label="Hentikan audio">
            <Square className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
