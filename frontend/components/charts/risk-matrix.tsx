"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { AlertCircle, CheckCircle2, ShieldAlert, TrendingDown } from "lucide-react";
import { RiskBadge } from "@/components/ui/badge";
import { AnimatedCounter } from "@/components/motion/motion-primitives";

interface RiskMatrixProps {
  riskLevel: string;
  contributingFactors?: string[];
  attendanceRate?: number;
  averageIaTrend?: string;
  className?: string;
}

export function RiskMatrix({
  riskLevel = "Low Risk",
  contributingFactors = [],
  attendanceRate = 85,
  averageIaTrend = "improving",
  className = "",
}: RiskMatrixProps) {
  const shouldReduceMotion = useReducedMotion();

  const isCritical = riskLevel.toLowerCase().includes("critical");
  const isHigh = riskLevel.toLowerCase().includes("high") || isCritical;
  const isModerate = riskLevel.toLowerCase().includes("moderate");

  // Approximate risk index (0 to 100)
  const riskScore = isCritical ? 88 : isHigh ? 72 : isModerate ? 45 : 18;

  const color = isHigh ? "var(--danger)" : isModerate ? "var(--amber)" : "var(--primary)";
  const bgSubtle = isHigh ? "var(--danger-subtle)" : isModerate ? "var(--amber-subtle)" : "var(--primary-subtle)";

  return (
    <div
      className={`risk-matrix-panel ${className}`}
      style={{
        padding: 20,
        borderRadius: "var(--radius-md)",
        background: "var(--surface)",
        border: "1px solid var(--line)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", color: "var(--ink-tertiary)" }}>
            Academic Stability Assessment
          </div>
          <h3 style={{ margin: "2px 0 0", fontSize: "1.15rem", fontWeight: 800 }}>Risk Index Matrix</h3>
        </div>
        <RiskBadge risk={riskLevel} />
      </div>

      {/* Meter Bar */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", fontWeight: 600, marginBottom: 6 }}>
          <span>Risk Probability Index</span>
          <span style={{ color }}>
            <AnimatedCounter value={riskScore} suffix="%" duration={1.2} />
          </span>
        </div>
        <div
          style={{
            height: 10,
            width: "100%",
            borderRadius: "var(--radius-full)",
            background: "var(--surface-subtle)",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <motion.div
            initial={shouldReduceMotion ? false : { width: 0 }}
            animate={{ width: `${riskScore}%` }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            style={{
              height: "100%",
              borderRadius: "var(--radius-full)",
              background: `linear-gradient(90deg, var(--primary) 0%, ${color} 100%)`,
            }}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "var(--ink-tertiary)", marginTop: 4 }}>
          <span>Safe (&lt;30%)</span>
          <span>Moderate (30-60%)</span>
          <span>Elevated (&gt;60%)</span>
        </div>
      </div>

      {/* Contributing Factors */}
      {contributingFactors && contributingFactors.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", color: "var(--ink-tertiary)" }}>
            Contributing Signals &amp; Drivers
          </div>
          {contributingFactors.map((factor, index) => (
            <motion.div
              key={index}
              initial={shouldReduceMotion ? false : { opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                padding: "8px 12px",
                borderRadius: "var(--radius-sm)",
                background: "var(--surface-subtle)",
                fontSize: "0.82rem",
                color: "var(--ink)",
                lineHeight: 1.45,
              }}
            >
              {isHigh ? (
                <ShieldAlert size={15} color="var(--danger)" style={{ marginTop: 2, flexShrink: 0 }} />
              ) : (
                <CheckCircle2 size={15} color="var(--primary)" style={{ marginTop: 2, flexShrink: 0 }} />
              )}
              <span>{factor}</span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
