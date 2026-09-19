"use client";

import React from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
  ComposedChart,
} from "recharts";
import type { SubjectAnalysis } from "@/types/api";

const PALETTE = [
  "#12634e", // Forest Emerald
  "#197278", // Cyber Teal
  "#c07817", // Amber
  "#b8332c", // Crimson
  "#3b5998", // Indigo
  "#7a3e9d", // Purple
];

interface IATrendChartProps {
  subjects: SubjectAnalysis[];
  maxIANumber?: number;
  height?: number;
  className?: string;
}

export function IATrendChart({
  subjects,
  maxIANumber = 3,
  height = 320,
  className = "",
}: IATrendChartProps) {
  if (!subjects || subjects.length === 0) {
    return (
      <div
        style={{
          height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--ink-tertiary)",
          fontSize: "0.9rem",
        }}
      >
        No assessment mark series available.
      </div>
    );
  }

  // Determine maximum IA number
  const totalIAs = Math.max(
    ...subjects.map((s) => s.percentages?.length || 0),
    maxIANumber
  );

  // Transform data for Recharts
  const chartData = Array.from({ length: totalIAs }, (_, i) => {
    const point: Record<string, any> = { name: `IA ${i + 1}` };
    subjects.forEach((sub) => {
      if (sub.percentages && sub.percentages[i] !== undefined) {
        point[sub.subject] = sub.percentages[i];
      }
    });
    return point;
  });

  return (
    <div className={`ia-trend-chart-container ${className}`} style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 12, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" opacity={0.6} />
          <XAxis
            dataKey="name"
            stroke="var(--ink-tertiary)"
            fontSize={12}
            tickLine={false}
            dy={6}
          />
          <YAxis
            stroke="var(--ink-tertiary)"
            fontSize={12}
            domain={[0, 100]}
            tickLine={false}
            dx={-4}
            unit="%"
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div
                    style={{
                      background: "rgba(255, 255, 255, 0.95)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid var(--line-strong)",
                      borderRadius: "var(--radius-sm)",
                      padding: "10px 14px",
                      boxShadow: "var(--shadow-md)",
                      fontSize: "0.84rem",
                    }}
                  >
                    <div style={{ fontWeight: 700, color: "var(--ink)", marginBottom: 6 }}>
                      {label} Performance
                    </div>
                    {payload.map((entry: any, index: number) => (
                      <div
                        key={`item-${index}`}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 14,
                          color: entry.color,
                          fontWeight: 600,
                          margin: "3px 0",
                        }}
                      >
                        <span>{entry.name}:</span>
                        <span>{Number(entry.value).toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend
            wrapperStyle={{ paddingTop: 14, fontSize: "0.82rem" }}
            iconType="circle"
          />

          {subjects.map((sub, idx) => {
            const color = PALETTE[idx % PALETTE.length];
            return (
              <Line
                key={sub.subject}
                type="monotone"
                dataKey={sub.subject}
                name={sub.subject}
                stroke={color}
                strokeWidth={2.5}
                dot={{ r: 4.5, fill: color, stroke: "#ffffff", strokeWidth: 2 }}
                activeDot={{ r: 7, fill: color, stroke: "#ffffff", strokeWidth: 3 }}
                animationDuration={1200}
                animationEasing="ease-out"
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
