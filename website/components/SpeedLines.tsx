"use client";

import { useEffect, useRef } from "react";

export function SpeedLines() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.querySelectorAll(".speed-line").forEach((line) => {
            line.classList.add("drawn");
          });
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const widths = [50, 80, 110, 80, 50];
  const delays = ["0s", "0.08s", "0.16s", "0.24s", "0.32s"];

  return (
    <div ref={ref} className="flex flex-col items-center gap-[3px] py-8">
      {widths.map((w, i) => (
        <div
          key={i}
          className="speed-line h-px bg-fog"
          style={{ width: `${w}px`, transitionDelay: delays[i] }}
        />
      ))}
    </div>
  );
}
