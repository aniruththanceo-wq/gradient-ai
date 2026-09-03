import React from "react";

export function Card({
  children,
  className = "",
  elevated = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { elevated?: boolean }) {
  return (
    <div
      className={`${elevated ? "gradient-card-elevated" : "gradient-card"} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`card-pad ${className}`}
      style={{ borderBottom: "1px solid var(--line-subtle)", paddingBottom: 16 }}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={className}
      style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700, color: "var(--ink)" }}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={className}
      style={{ margin: "4px 0 0", fontSize: "0.88rem", color: "var(--ink-secondary)" }}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardContent({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`card-pad ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`card-pad ${className}`}
      style={{
        borderTop: "1px solid var(--line-subtle)",
        paddingTop: 16,
        paddingBottom: 16,
        background: "var(--surface-subtle)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
      {...props}
    >
      {children}
    </div>
  );
}
