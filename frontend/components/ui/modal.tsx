"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = "540px",
}: ModalProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        backgroundColor: "rgba(15, 25, 23, 0.6)",
        backdropFilter: "blur(4px)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="gradient-card-elevated"
        style={{
          width: "100%",
          maxWidth,
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          animation: "modalPop 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
          background: "var(--surface)",
        }}
      >
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid var(--line-subtle)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <div>
            {title && (
              <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700, color: "var(--ink)" }}>
                {title}
              </h2>
            )}
            {description && (
              <p style={{ margin: "4px 0 0", fontSize: "0.85rem", color: "var(--ink-secondary)" }}>
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--ink-tertiary)",
              cursor: "pointer",
              padding: 4,
              borderRadius: "var(--radius-xs)",
              display: "flex",
            }}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>
        <div style={{ padding: "24px", overflowY: "auto" }}>{children}</div>
      </div>
    </div>
  );
}
