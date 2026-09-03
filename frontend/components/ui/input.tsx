import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: React.ReactNode;
}

export function Input({
  label,
  hint,
  error,
  leftIcon,
  className = "",
  id,
  ...props
}: InputProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
        </label>
      )}
      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        {leftIcon && (
          <span
            style={{
              position: "absolute",
              left: 12,
              color: "var(--ink-tertiary)",
              pointerEvents: "none",
              display: "flex",
              alignItems: "center",
            }}
          >
            {leftIcon}
          </span>
        )}
        <input
          id={inputId}
          className={`form-input ${className}`}
          style={{
            paddingLeft: leftIcon ? 38 : 14,
            borderColor: error ? "var(--danger)" : undefined,
          }}
          {...props}
        />
      </div>
      {hint && !error && <span className="form-hint">{hint}</span>}
      {error && (
        <span className="form-hint" style={{ color: "var(--danger)", fontWeight: 600 }}>
          {error}
        </span>
      )}
    </div>
  );
}
