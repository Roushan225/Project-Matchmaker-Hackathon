"use client";

import { useEffect, useRef, useState } from "react";

type ScrollScaleProps = {
  children: React.ReactNode;
  className?: string;
};

export function ScrollScale({ children, className = "" }: ScrollScaleProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(1);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) return;

    let frame = 0;
    const updateProgress = () => {
      frame = 0;
      const element = elementRef.current;
      if (!element) return;

      const bounds = element.getBoundingClientRect();
      const viewportCenter = window.innerHeight / 2;
      const elementCenter = bounds.top + bounds.height / 2;
      const distance = Math.abs(elementCenter - viewportCenter);
      const range = window.innerHeight * 0.72 + bounds.height / 2;
      setProgress(Math.max(0, Math.min(1, 1 - distance / range)));
    };

    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(updateProgress);
    };

    frame = window.requestAnimationFrame(updateProgress);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  const scale = 0.9 + progress * 0.1;
  const opacity = 0.45 + progress * 0.55;

  return (
    <div
      ref={elementRef}
      className={`scroll-scale ${className}`}
      style={{ transform: `scale(${scale})`, opacity }}
    >
      {children}
    </div>
  );
}
