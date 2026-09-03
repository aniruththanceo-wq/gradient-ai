import React from "react";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export function Textarea({
  label,
  hint,
  error,
  className = "",
  id,
  ...props
}: TextareaProps) {
  const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={textareaId} className="form-label">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={`form-textarea ${className}`}
        style={{ borderColor: error ? "var(--danger)" : undefined }}
        {...props}
      />
      {hint && !error && <span className="form-hint">{hint}</span>}
      {error && (
        <span className="form-hint" style={{ color: "var(--danger)", fontWeight: 600 }}>
          {error}
        </span>
      )}
    </div>
  );
}
