import React from "react";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
  options?: { value: string | number; label: string }[];
}

export function Select({
  label,
  hint,
  error,
  options,
  children,
  className = "",
  id,
  ...props
}: SelectProps) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={selectId} className="form-label">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`form-select ${className}`}
        style={{ borderColor: error ? "var(--danger)" : undefined }}
        {...props}
      >
        {options
          ? options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))
          : children}
      </select>
      {hint && !error && <span className="form-hint">{hint}</span>}
      {error && (
        <span className="form-hint" style={{ color: "var(--danger)", fontWeight: 600 }}>
          {error}
        </span>
      )}
    </div>
  );
}
