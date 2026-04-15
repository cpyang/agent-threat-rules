"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface CountUpProps {
  target: number;
  suffix?: string;
  prefix?: string;
  useComma?: boolean;
  duration?: number;
  className?: string;
  /** If set, this CountUp will update when a live stat with this key arrives via StatsHydrator */
  liveKey?: string;
}

export function CountUp({
  target,
  suffix = "",
  prefix = "",
  useComma = false,
  duration = 1500,
  className = "",
  liveKey,
}: CountUpProps) {
  const [currentTarget, setCurrentTarget] = useState(target);
  // SSR: render real target value so crawlers index actual numbers, not "0"
  const formatInitial = (n: number) => {
    const isFloat = n % 1 !== 0;
    return isFloat ? n.toFixed(1) : useComma ? n.toLocaleString() : String(n);
  };
  const [display, setDisplay] = useState(`${prefix}${formatInitial(target)}${suffix}`);
  const ref = useRef<HTMLSpanElement>(null);
  const animated = useRef(false);

  const formatNumber = useCallback(
    (n: number) => {
      const isFloat = n % 1 !== 0;
      return isFloat ? n.toFixed(1) : useComma ? n.toLocaleString() : String(n);
    },
    [useComma]
  );

  // Listen for live stat updates
  useEffect(() => {
    if (!liveKey) return;

    function onLiveStats(e: Event) {
      const detail = (e as CustomEvent).detail as Record<string, number>;
      if (liveKey && liveKey in detail && detail[liveKey] !== currentTarget) {
        setCurrentTarget(detail[liveKey]);
      }
    }

    window.addEventListener("atr:live-stats", onLiveStats);
    return () => window.removeEventListener("atr:live-stats", onLiveStats);
  }, [liveKey, currentTarget]);

  // Animate on viewport entry or when target changes from live update
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // If already animated and target changed (live update), just set the new value
    if (animated.current) {
      setDisplay(`${prefix}${formatNumber(currentTarget)}${suffix}`);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animated.current) {
          animated.current = true;

          if (prefersReduced) {
            setDisplay(`${prefix}${formatNumber(currentTarget)}${suffix}`);
            observer.disconnect();
            return;
          }

          const isFloat = currentTarget % 1 !== 0;
          const start = performance.now();

          function update(now: number) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = currentTarget * eased;

            let formatted: string;
            if (isFloat) {
              formatted = current.toFixed(1);
            } else if (useComma) {
              formatted = Math.round(current).toLocaleString();
            } else {
              formatted = String(Math.round(current));
            }

            setDisplay(`${prefix}${formatted}${suffix}`);

            if (progress < 1) {
              requestAnimationFrame(update);
            } else {
              setDisplay(`${prefix}${formatNumber(currentTarget)}${suffix}`);
            }
          }

          requestAnimationFrame(update);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [currentTarget, suffix, prefix, useComma, duration, formatNumber]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
