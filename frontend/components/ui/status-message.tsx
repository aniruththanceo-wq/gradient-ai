import React from "react";
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from "lucide-react";

export interface StatusMessageProps {
  kind?: "success" | "error" | "warning" | "info";
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export function StatusMessage({
  kind = "info",
  children,
  title,
  className = "",
}: StatusMessageProps) {
  const config = {
    success: {
      bg: "var(--success-subtle)",
      color: "var(--success)",
      border: "rgba(29, 124, 77, 0.25)",
      icon: <CheckCircle2 size={18} />,
    },
    error: {
      bg: "var(--danger-subtle)",
      color: "var(--danger)",
      border: "rgba(184, 51, 44, 0.25)",
      icon: <AlertCircle size={18} />,
    },
    warning: {
      bg: "var(--amber-subtle)",
      color: "var(--amber)",
      border: "rgba(192, 120, 23, 0.25)",
      icon: <AlertTriangle size={18} />,
    },
    info: {
      bg: "var(--teal-subtle)",
      color: "var(--teal)",
      border: "rgba(25, 114, 120, 0.25)",
      icon: <Info size={18} />,
    },
  }[kind];

  return (
    <div
      className={className}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "14px 16px",
        borderRadius: "var(--radius-sm)",
        background: config.bg,
        border: `1px solid ${config.border}`,
        color: "var(--ink)",
        fontSize: "0.9rem",
        lineHeight: 1.5,
      }}
    >
      <span style={{ color: config.color, marginTop: 1, flexShrink: 0 }}>{config.icon}</span>
      <div style={{ flex: 1 }}>
        {title && (
          <div style={{ fontWeight: 700, marginBottom: 2, color: config.color }}>{title}</div>
        )}
        <div>{children}</div>
      </div>
    </div>
  );
}
