"use client";

import { useEffect, useRef } from "react";

/**
 * Animated grid background for the hero.
 * Draws subtle horizontal + vertical lines that slowly drift.
 * A radial "scan" sweeps across periodically, brightening lines it touches.
 * Matches the ATR logo's speed-line / radar-sweep motif.
 */
export function HeroGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    let animId: number;
    let mouseX = -9999;
    let mouseY = -9999;

    function resize() {
      const parent = canvas!.parentElement;
      if (!parent) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      canvas!.style.width = `${w}px`;
      canvas!.style.height = `${h}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    const gap = 48;
    const lineColor = "rgba(0, 0, 0, 0.06)";
    const activeColor = "rgba(37, 99, 235, 0.18)";
    const sweepColor = "rgba(37, 99, 235, 0.1)";

    function draw(time: number) {
      const w = canvas!.clientWidth;
      const h = canvas!.clientHeight;
      ctx!.clearRect(0, 0, w, h);

      const t = prefersReduced ? 0 : time * 0.0003;
      const drift = prefersReduced ? 0 : Math.sin(t) * 8;

      // Sweep line — a vertical line that slowly moves across
      const sweepX = prefersReduced
        ? -100
        : ((time * 0.04) % (w + 200)) - 100;

      // Vertical lines
      const cols = Math.ceil(w / gap) + 2;
      for (let i = -1; i < cols; i++) {
        const x = i * gap + drift;

        // Distance from sweep
        const sweepDist = Math.abs(x - sweepX);
        const sweepInfluence = Math.max(0, 1 - sweepDist / 120);

        // Distance from cursor
        const cursorDist = Math.abs(x - mouseX);
        const cursorInfluence = Math.max(0, 1 - cursorDist / 200);

        const influence = Math.max(sweepInfluence, cursorInfluence);

        if (influence > 0.01) {
          ctx!.strokeStyle = activeColor;
          ctx!.globalAlpha = influence;
        } else {
          ctx!.strokeStyle = lineColor;
          ctx!.globalAlpha = 1;
        }

        ctx!.beginPath();
        ctx!.moveTo(x, 0);
        ctx!.lineTo(x, h);
        ctx!.lineWidth = influence > 0.01 ? 1 : 0.5;
        ctx!.stroke();
      }

      // Horizontal lines
      const rows = Math.ceil(h / gap) + 2;
      for (let j = -1; j < rows; j++) {
        const y = j * gap - drift * 0.5;

        const cursorDist = Math.abs(y - mouseY);
        const cursorInfluence = Math.max(0, 1 - cursorDist / 200);

        // Sweep glow on horizontal lines near sweepX
        const hSweepInfluence = mouseX < 0 ? 0 : cursorInfluence;

        if (hSweepInfluence > 0.01) {
          ctx!.strokeStyle = activeColor;
          ctx!.globalAlpha = hSweepInfluence;
        } else {
          ctx!.strokeStyle = lineColor;
          ctx!.globalAlpha = 1;
        }

        ctx!.beginPath();
        ctx!.moveTo(0, y);
        ctx!.lineTo(w, y);
        ctx!.lineWidth = hSweepInfluence > 0.01 ? 1 : 0.5;
        ctx!.stroke();
      }

      // Sweep line glow
      if (!prefersReduced && sweepX > -100 && sweepX < w + 100) {
        const gradient = ctx!.createLinearGradient(sweepX - 60, 0, sweepX + 60, 0);
        gradient.addColorStop(0, "rgba(37, 99, 235, 0)");
        gradient.addColorStop(0.5, sweepColor);
        gradient.addColorStop(1, "rgba(37, 99, 235, 0)");
        ctx!.fillStyle = gradient;
        ctx!.globalAlpha = 0.5;
        ctx!.fillRect(sweepX - 60, 0, 120, h);
      }

      ctx!.globalAlpha = 1;

      animId = requestAnimationFrame(draw);
    }

    function onMouseMove(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    }

    function onMouseLeave() {
      mouseX = -9999;
      mouseY = -9999;
    }

    resize();
    animId = requestAnimationFrame(draw);

    const parent = canvas!.parentElement;
    parent?.addEventListener("mousemove", onMouseMove);
    parent?.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(animId);
      parent?.removeEventListener("mousemove", onMouseMove);
      parent?.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      aria-hidden="true"
    />
  );
}
