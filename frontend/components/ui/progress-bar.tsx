import React from "react";

export interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  label?: string;
  subLabel?: string;
  variant?: "primary" | "teal" | "amber" | "danger" | "auto";
  showValue?: boolean;
  size?: "sm" | "md" | "lg";
}

export function ProgressBar({
  value,
  max = 100,
  label,
  subLabel,
  variant = "auto",
  showValue = true,
  size = "md",
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  let color = "var(--primary)";
  if (variant === "auto") {
    if (percentage >= 75) color = "var(--primary)";
    else if (percentage >= 50) color = "var(--amber)";
    else color = "var(--danger)";
  } else if (variant === "teal") {
    color = "var(--teal)";
  } else if (variant === "amber") {
    color = "var(--amber)";
  } else if (variant === "danger") {
    color = "var(--danger)";
  }

  const height = {
    sm: 6,
    md: 10,
    lg: 14,
  }[size];

  return (
    <div style={{ width: "100%" }}>
      {(label || showValue) && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: 6,
          }}
        >
          {label && (
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--ink)" }}>
              {label}
            </span>
          )}
          {subLabel && (
            <span style={{ fontSize: "0.8rem", color: "var(--ink-tertiary)" }}>{subLabel}</span>
          )}
          {showValue && !subLabel && (
            <span style={{ fontSize: "0.85rem", fontWeight: 700, color }}>{percentage}%</span>
          )}
        </div>
      )}
      <div
        style={{
          width: "100%",
          height,
          backgroundColor: "var(--surface-subtle)",
          border: "1px solid var(--line-subtle)",
          borderRadius: "var(--radius-full)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: "100%",
            backgroundColor: color,
            borderRadius: "var(--radius-full)",
            transition: "width 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        />
      </div>
    </div>
  );
}
