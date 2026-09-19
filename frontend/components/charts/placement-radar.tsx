"use client";

import React from "react";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { motion } from "framer-motion";
import { AnimatedCounter } from "@/components/motion/motion-primitives";

interface ReadinessDimensions {
  academics: number;
  aptitude: number;
  coding: number;
  communication: number;
  portfolio: number;
  skills: number;
}

interface PlacementRadarProps {
  dimensions?: ReadinessDimensions;
  readinessScore?: number;
  stageReadiness?: Record<string, string>;
  height?: number;
  className?: string;
}

export function PlacementRadar({
  dimensions,
  readinessScore = 0,
  stageReadiness,
  height = 320,
  className = "",
}: PlacementRadarProps) {
  const data = dimensions
    ? [
        { subject: "Academics", A: dimensions.academics, fullMark: 100 },
        { subject: "Aptitude", A: dimensions.aptitude, fullMark: 100 },
        { subject: "Coding", A: dimensions.coding, fullMark: 100 },
        { subject: "Communication", A: dimensions.communication, fullMark: 100 },
        { subject: "Portfolio", A: dimensions.portfolio, fullMark: 100 },
        { subject: "Skills", A: dimensions.skills, fullMark: 100 },
      ]
    : [];

  if (!dimensions || data.length === 0) {
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
        Complete initial profile &amp; assessments to generate readiness radar.
      </div>
    );
  }

  return (
    <div className={`placement-radar-container ${className}`} style={{ width: "100%" }}>
      {/* Radar Chart */}
      <div style={{ width: "100%", height }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
            <PolarGrid stroke="var(--line)" />
            <PolarAngleAxis
              dataKey="subject"
              stroke="var(--ink)"
              fontSize={12}
              tick={{ fill: "var(--ink-secondary)", fontWeight: 600 }}
            />
            <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="var(--ink-tertiary)" fontSize={10} />
            <Radar
              name="Student Capability"
              dataKey="A"
              stroke="var(--primary)"
              fill="var(--primary)"
              fillOpacity={0.35}
              animationDuration={1300}
              animationEasing="ease-out"
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const entry = payload[0];
                  return (
                    <div
                      style={{
                        background: "rgba(255, 255, 255, 0.96)",
                        backdropFilter: "blur(8px)",
                        border: "1px solid var(--line-strong)",
                        borderRadius: "var(--radius-sm)",
                        padding: "8px 12px",
                        fontSize: "0.82rem",
                        boxShadow: "var(--shadow-md)",
                      }}
                    >
                      <div style={{ fontWeight: 700, color: "var(--ink)" }}>{entry.payload.subject}</div>
                      <div style={{ color: "var(--primary)", fontWeight: 600, marginTop: 2 }}>
                        Readiness Score: {Number(entry.value).toFixed(1)} / 100
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* 6-Dimension Score Pills */}
      <div className="grid-3" style={{ gap: 10, marginTop: 12 }}>
        {data.map((item) => (
          <div
            key={item.subject}
            style={{
              padding: "8px 12px",
              borderRadius: "var(--radius-sm)",
              background: "var(--surface-subtle)",
              border: "1px solid var(--line)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "0.82rem",
            }}
          >
            <span style={{ fontWeight: 600, color: "var(--ink)" }}>{item.subject}</span>
            <span style={{ fontWeight: 800, color: "var(--primary)" }}>
              <AnimatedCounter value={item.A} suffix="%" duration={1} />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
