"use client";

import { motion } from "framer-motion";
import React from "react";
import { MotionRevealProps } from "@/types";

export default function MotionReveal({
  children,
  delay = 0,
  direction = "up",
  className = "",
}: MotionRevealProps) {
  const yOffset = direction === "up" ? 30 : direction === "down" ? -30 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: yOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.21, 0.47, 0.32, 0.98], // Curva cúbica bezier suave estilo Apple/Nuro
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}