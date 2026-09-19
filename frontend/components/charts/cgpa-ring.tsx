"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { AnimatedCounter } from "@/components/motion/motion-primitives";

interface CGPARingProps {
  cgpa: number;
  predictedCgpa?: number;
  maxCgpa?: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function CGPARing({
  cgpa,
  predictedCgpa,
  maxCgpa = 10,
  size = 180,
  strokeWidth = 12,
  className = "",
}: CGPARingProps) {
  const shouldReduceMotion = useReducedMotion();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const validCgpa = Math.min(Math.max(cgpa || 0, 0), maxCgpa);
  const percentage = (validCgpa / maxCgpa) * 100;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Determine color based on CGPA tier
  const color =
    validCgpa >= 8.5
      ? "var(--primary)"
      : validCgpa >= 7.0
      ? "var(--teal)"
      : validCgpa >= 6.0
      ? "var(--amber)"
      : "var(--danger)";

  const glowColor =
    validCgpa >= 8.5
      ? "rgba(18, 99, 78, 0.35)"
      : validCgpa >= 7.0
      ? "rgba(25, 114, 120, 0.35)"
      : validCgpa >= 6.0
      ? "rgba(192, 120, 23, 0.35)"
      : "rgba(184, 51, 44, 0.35)";

  return (
    <div
      className={`cgpa-ring-wrapper ${className}`}
      style={{
        position: "relative",
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)", overflow: "visible" }}>
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--surface-subtle)"
          strokeWidth={strokeWidth}
        />

        {/* Animated CGPA progress arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={shouldReduceMotion ? false : { strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          style={{
            filter: `drop-shadow(0 0 8px ${glowColor})`,
          }}
        />
      </svg>

      {/* Central Content */}
      <div
        style={{
          position: "absolute",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <span
          style={{
            fontSize: "0.75rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: "var(--ink-tertiary)",
          }}
        >
          Cumulative CGPA
        </span>
        <div style={{ fontSize: "2.2rem", fontWeight: 800, color: "var(--ink)", lineHeight: 1.1 }}>
          <AnimatedCounter value={validCgpa} decimals={2} duration={1.3} />
        </div>
        <span style={{ fontSize: "0.78rem", color: "var(--ink-secondary)", marginTop: 2 }}>
          / {maxCgpa.toFixed(1)} scale
        </span>
        {predictedCgpa !== undefined && (
          <div
            style={{
              marginTop: 4,
              fontSize: "0.72rem",
              fontWeight: 600,
              padding: "2px 8px",
              borderRadius: "var(--radius-full)",
              background: "var(--primary-subtle)",
              color: "var(--primary)",
            }}
          >
            ML Forecast: {predictedCgpa.toFixed(2)}
          </div>
        )}
      </div>
    </div>
  );
}
