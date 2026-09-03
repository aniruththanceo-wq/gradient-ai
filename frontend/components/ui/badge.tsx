import React from "react";

export type BadgeVariant =
  | "default"
  | "emerald"
  | "amber"
  | "danger"
  | "neutral"
  | "year";

export function Badge({
  children,
  variant = "default",
  icon,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
  icon?: React.ReactNode;
}) {
  const variantMap: Record<BadgeVariant, string> = {
    default: "badge-emerald",
    emerald: "badge-emerald",
    amber: "badge-amber",
    danger: "badge-danger",
    neutral: "badge-neutral",
    year: "badge-year",
  };

  return (
    <span className={`badge ${variantMap[variant]} ${className}`} {...props}>
      {icon}
      {children}
    </span>
  );
}

export function RiskBadge({ risk }: { risk: string }) {
  const lower = risk?.toLowerCase() || "";
  let variant: BadgeVariant = "emerald";
  if (lower.includes("critical") || lower.includes("high")) {
    variant = "danger";
  } else if (lower.includes("moderate")) {
    variant = "amber";
  }

  return <Badge variant={variant}>{risk || "Low Risk"}</Badge>;
}

export function PriorityBadge({ priority }: { priority: string }) {
  const lower = priority?.toLowerCase() || "";
  let variant: BadgeVariant = "neutral";
  if (lower === "high") {
    variant = "danger";
  } else if (lower === "moderate" || lower === "medium") {
    variant = "amber";
  } else if (lower === "low") {
    variant = "emerald";
  }

  return <Badge variant={variant}>{priority} Priority</Badge>;
}
