"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface HeroEntranceProps {
  children: ReactNode;
  delay: number;
  className?: string;
}

export function HeroEntrance({ children, delay, className = "" }: HeroEntranceProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      ref.current?.classList.add("on");
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      ref={ref}
      className={`hero-enter ${className}`}
      style={{ transitionDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
}
