"use client";

import React, { useEffect } from "react";
import Lenis from "lenis";
import { SmoothScrollProps } from "@/types";

export default function SmoothScroll({ children }: SmoothScrollProps): React.JSX.Element {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}