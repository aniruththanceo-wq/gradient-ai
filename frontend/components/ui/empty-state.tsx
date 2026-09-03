import React from "react";
import { Sparkles } from "lucide-react";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon = <Sparkles size={32} color="var(--primary)" />,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`gradient-card card-pad-lg ${className}`}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "48px 24px",
      }}
    >
      <div
        style={{
          width: 60,
          height: 60,
          borderRadius: "var(--radius-full)",
          background: "var(--primary-subtle)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16,
        }}
      >
        {icon}
      </div>
      <h3 style={{ margin: "0 0 8px", fontSize: "1.2rem", fontWeight: 700, color: "var(--ink)" }}>
        {title}
      </h3>
      <p
        style={{
          margin: "0 0 20px",
          fontSize: "0.92rem",
          color: "var(--ink-secondary)",
          maxWidth: 440,
          lineHeight: 1.55,
        }}
      >
        {description}
      </p>
      {action}
    </div>
  );
}
