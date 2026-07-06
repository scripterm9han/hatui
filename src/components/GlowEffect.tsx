"use client";

import { useEffect } from "react";

/**
 * Global client component that tracks mouse coordinates
 * and stores them in CSS variables on the root document.
 * This powers the high-fidelity radial glows across the dark background.
 */
export default function GlowEffect() {
  useEffect(() => {
    const updateGlowCoords = (e: PointerEvent | MouseEvent) => {
      document.documentElement.style.setProperty("--x", `${e.clientX}px`);
      document.documentElement.style.setProperty("--y", `${e.clientY}px`);
    };

    window.addEventListener("pointermove", updateGlowCoords);
    window.addEventListener("mousemove", updateGlowCoords);

    return () => {
      window.removeEventListener("pointermove", updateGlowCoords);
      window.removeEventListener("mousemove", updateGlowCoords);
    };
  }, []);

  return null;
}
