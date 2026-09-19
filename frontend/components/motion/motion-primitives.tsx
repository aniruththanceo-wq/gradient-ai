"use client";

import React, { useEffect, useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

export const easeSmooth = [0.16, 1, 0.3, 1] as const;

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (custom = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: custom * 0.08,
      ease: easeSmooth,
    },
  }),
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: (custom = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: custom * 0.08,
      ease: easeSmooth,
    },
  }),
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: (custom = 0) => ({
    opacity: 1,
    transition: {
      duration: 0.5,
      delay: custom * 0.08,
      ease: easeSmooth,
    },
  }),
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: (custom = 0) => ({
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      delay: custom * 0.08,
      ease: easeSmooth,
    },
  }),
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: easeSmooth },
  },
};

/**
 * PageTransition wrapper for smooth route change entrances
 */
export function PageTransition({ children, className }: { children: React.ReactNode; className?: string }) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.4, ease: easeSmooth }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Animated number counter component for smooth KPI updates
 */
export function AnimatedCounter({
  value,
  duration = 1.2,
  decimals = 0,
  prefix = "",
  suffix = "",
}: {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) {
      setDisplayValue(value);
      return;
    }

    let start = 0;
    const end = Number(value);
    if (isNaN(end)) {
      setDisplayValue(0);
      return;
    }

    const startTime = performance.now();
    const durationMs = duration * 1000;

    function step(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * easeProgress;
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setDisplayValue(end);
      }
    }

    requestAnimationFrame(step);
  }, [value, duration, shouldReduceMotion]);

  return (
    <span>
      {prefix}
      {displayValue.toFixed(decimals)}
      {suffix}
    </span>
  );
}

/**
 * Glowing elevated card with glass depth
 */
export function GlowingCard({
  children,
  className = "",
  glowColor = "rgba(18, 99, 78, 0.2)",
  delay = 0,
  hover = true,
  style,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  delay?: number;
  hover?: boolean;
  style?: React.CSSProperties;
  onClick?: () => void;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay * 0.08, ease: easeSmooth }}
      whileHover={
        hover && !shouldReduceMotion
          ? {
              y: -3,
              boxShadow: `0 12px 32px -8px ${glowColor}, 0 4px 12px rgba(15, 25, 23, 0.06)`,
              borderColor: "var(--line-strong)",
              transition: { duration: 0.2, ease: "easeOut" },
            }
          : undefined
      }
      className={`gradient-card ${className}`}
      style={style}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}

/**
 * Animated Section Reveal
 */
export function MotionSection({
  children,
  id,
  className = "",
  delay = 0,
  style,
}: {
  children: React.ReactNode;
  id?: string;
  className?: string;
  delay?: number;
  style?: React.CSSProperties;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      id={id}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, delay: delay * 0.1, ease: easeSmooth }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}
