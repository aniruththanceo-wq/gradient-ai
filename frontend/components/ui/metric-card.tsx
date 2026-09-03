import React from "react";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";

export interface MetricCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  trend?: "improving" | "declining" | "stable" | "fluctuating";
  trendLabel?: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  className?: string;
}

export function MetricCard({
  title,
  value,
  subValue,
  trend,
  trendLabel,
  icon,
  badge,
  className = "",
}: MetricCardProps) {
  return (
    <div
      className={`gradient-card card-pad ${className}`}
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: 130,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <span
          style={{
            fontSize: "0.85rem",
            fontWeight: 600,
            color: "var(--ink-secondary)",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
        >
          {title}
        </span>
        {badge || (icon && <span style={{ color: "var(--primary)" }}>{icon}</span>)}
      </div>

      <div style={{ marginTop: 12 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span
            style={{
              fontSize: "2.1rem",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: "var(--ink)",
              lineHeight: 1.1,
            }}
          >
            {value}
          </span>
          {subValue && (
            <span style={{ fontSize: "0.95rem", color: "var(--ink-tertiary)", fontWeight: 600 }}>
              {subValue}
            </span>
          )}
        </div>

        {(trend || trendLabel) && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              marginTop: 6,
              fontSize: "0.82rem",
              fontWeight: 600,
              color:
                trend === "improving"
                  ? "var(--success)"
                  : trend === "declining"
                  ? "var(--danger)"
                  : "var(--ink-secondary)",
            }}
          >
            {trend === "improving" && <TrendingUp size={15} />}
            {trend === "declining" && <TrendingDown size={15} />}
            {trend === "stable" && <Minus size={15} />}
            <span>{trendLabel || (trend ? trend.charAt(0).toUpperCase() + trend.slice(1) : "")}</span>
          </div>
        )}
      </div>
    </div>
  );
}
