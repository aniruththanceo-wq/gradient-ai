"use client";

import React from "react";

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className = "" }: TabsProps) {
  return (
    <div
      className={className}
      style={{
        display: "flex",
        gap: 8,
        borderBottom: "1px solid var(--line)",
        paddingBottom: 2,
        overflowX: "auto",
      }}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 16px",
              fontSize: "0.92rem",
              fontWeight: isActive ? 700 : 500,
              color: isActive ? "var(--primary)" : "var(--ink-secondary)",
              background: "transparent",
              border: "none",
              borderBottom: isActive ? "2.5px solid var(--primary)" : "2.5px solid transparent",
              marginBottom: "-2px",
              cursor: "pointer",
              transition: "all 140ms ease",
              whiteSpace: "nowrap",
            }}
          >
            {tab.icon}
            {tab.label}
            {tab.badge !== undefined && (
              <span
                style={{
                  fontSize: "0.75rem",
                  padding: "1px 6px",
                  borderRadius: "var(--radius-full)",
                  background: isActive ? "var(--primary-subtle)" : "var(--surface-subtle)",
                  color: isActive ? "var(--primary)" : "var(--ink-tertiary)",
                  fontWeight: 600,
                }}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
