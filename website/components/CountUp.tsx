"use client";

import { useEffect, useRef, useState } from "react";

interface CountUpProps {
  target: number;
  suffix?: string;
  prefix?: string;
  useComma?: boolean;
  duration?: number;
  className?: string;
}

export function CountUp({
  target,
  suffix = "",
  prefix = "",
  useComma = false,
  duration = 1500,
  className = "",
}: CountUpProps) {
  const [display, setDisplay] = useState(`${prefix}0${suffix}`);
  const ref = useRef<HTMLSpanElement>(null);
  const animated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animated.current) {
          animated.current = true;
          const isFloat = target % 1 !== 0;
          const start = performance.now();

          function update(now: number) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = target * eased;

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
              const final = isFloat ? target.toFixed(1) : useComma ? target.toLocaleString() : String(target);
              setDisplay(`${prefix}${final}${suffix}`);
            }
          }

          requestAnimationFrame(update);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target, suffix, prefix, useComma, duration]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
