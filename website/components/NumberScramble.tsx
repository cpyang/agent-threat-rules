"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";

interface NumberScrambleProps {
  target: string;
  duration?: number;
  className?: string;
  /** If set, listens for live stat updates via StatsHydrator */
  liveKey?: string;
}

const CHARS = "0123456789";

export function NumberScramble({
  target,
  duration = 1400,
  className = "",
  liveKey,
}: NumberScrambleProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [display, setDisplay] = useState(target.replace(/[0-9]/g, "0"));
  const [currentTarget, setCurrentTarget] = useState(target);
  const hasAnimated = useRef(false);

  // Listen for live stat updates
  useEffect(() => {
    if (!liveKey) return;
    function onLiveStats(e: Event) {
      const detail = (e as CustomEvent).detail as Record<string, number>;
      if (liveKey && liveKey in detail) {
        const newVal = String(detail[liveKey]);
        if (newVal !== currentTarget) {
          setCurrentTarget(newVal);
          setDisplay(newVal);
        }
      }
    }
    window.addEventListener("atr:live-stats", onLiveStats);
    return () => window.removeEventListener("atr:live-stats", onLiveStats);
  }, [liveKey, currentTarget]);

  useEffect(() => {
    if (!isInView || hasAnimated.current) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) {
      setDisplay(currentTarget);
      hasAnimated.current = true;
      return;
    }

    hasAnimated.current = true;
    const targetChars = currentTarget.split("");
    const totalFrames = Math.round(duration / 16);
    let frame = 0;

    const interval = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      // Ease out — slow down at the end
      const eased = 1 - Math.pow(1 - progress, 3);

      setDisplay(
        targetChars
          .map((char, i) => {
            if (!/[0-9]/.test(char)) return char;
            // Each digit resolves at a different time — left to right
            const charDelay = i / targetChars.length;
            const charProgress = Math.max(
              0,
              (eased - charDelay * 0.4) / (1 - charDelay * 0.4)
            );
            if (charProgress >= 1) return char;
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join("")
      );

      if (frame >= totalFrames) {
        clearInterval(interval);
        setDisplay(currentTarget);
      }
    }, 16);

    return () => clearInterval(interval);
  }, [isInView, currentTarget, duration]);

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {display}
    </span>
  );
}
