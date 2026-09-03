import React from "react";

export function Skeleton({
  width,
  height,
  borderRadius,
  className = "",
  style,
}: {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width: width || "100%",
        height: height || 20,
        borderRadius: borderRadius || "var(--radius-sm)",
        ...style,
      }}
    />
  );
}
