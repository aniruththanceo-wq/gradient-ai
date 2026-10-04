"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function SystemHudOverlay() {
  const pathname = usePathname();
  const [scrollPercent, setScrollPercent] = useState(0);
  const [sectorName, setSectorName] = useState("SECTOR 01: AWAKENING NEXUS");
  const [depthZ, setDepthZ] = useState(40);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, scrollY / maxScroll));
      setScrollPercent(Math.round(progress * 100));

      // Calculate simulated Z-Depth in meters
      const calculatedZ = Math.round(40 - progress * 410);
      setDepthZ(calculatedZ);

      // Determine active Sector
      if (pathname === "/academic") {
        setSectorName("SECTOR 02: ACADEMIC TRAJECTORY MATRIX");
      } else if (pathname === "/placement") {
        setSectorName("SECTOR 04: 6D CAPABILITY LATTICE");
      } else if (pathname === "/reports") {
        setSectorName("SECTOR 05: DOSSIER COMPILATION VAULT");
      } else if (pathname === "/onboarding") {
        setSectorName("SECTOR 00: IDENTITY CONSTELLATION");
      } else if (pathname === "/dashboard") {
        setSectorName("COMMAND DECK: TELEMETRY OVERVIEW");
      } else {
        // Landing page multi-sector mapping
        if (progress < 0.18) {
          setSectorName("SECTOR 01: AWAKENING NEXUS");
        } else if (progress < 0.38) {
          setSectorName("SECTOR 02: MULTI-EXAM REGRESSION");
        } else if (progress < 0.58) {
          setSectorName("SECTOR 03: 6D CAREER RADAR");
        } else if (progress < 0.78) {
          setSectorName("SECTOR 04: INTELLIGENCE PIPELINE");
        } else {
          setSectorName("SECTOR 05: HORIZON GATEWAY");
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  if (!isClient) return null;

  return (
    <aside
      className="system-hud-layer"
      aria-label="System telemetry instrumentation"
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 1,
        overflow: "hidden",
      }}
    >
      {/* Viewport Corner Brackets */}
      <div className="hud-corner hud-corner-tl" />
      <div className="hud-corner hud-corner-tr" />
      <div className="hud-corner hud-corner-bl" />
      <div className="hud-corner hud-corner-br" />

      {/* Top Left: System Kernel Telemetry */}
      <div
        className="hud-module hud-top-left"
        style={{
          position: "absolute",
          top: 76,
          left: 24,
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontFamily: "var(--font-mono)",
          fontSize: "0.72rem",
          color: "var(--ink-tertiary)",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        <span className="hud-pulse-dot" />
        <span>GRADIENT_CORE // SYS.ONLINE // SYNC: 99.8%</span>
      </div>

      {/* Top Right: Active Sector Indicator */}
      <div
        className="hud-module hud-top-right"
        style={{
          position: "absolute",
          top: 76,
          right: 24,
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontFamily: "var(--font-mono)",
          fontSize: "0.72rem",
          fontWeight: 700,
          color: "var(--primary)",
          letterSpacing: "0.06em",
        }}
      >
        <span style={{ opacity: 0.5 }}>[</span>
        <span>{sectorName}</span>
        <span style={{ opacity: 0.5 }}>]</span>
      </div>

      {/* Right Edge: Depth Elevator Telemetry Meter */}
      <div
        className="hud-module hud-right-meter"
        style={{
          position: "absolute",
          right: 18,
          top: "50%",
          transform: "translateY(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
          fontFamily: "var(--font-mono)",
          fontSize: "0.68rem",
          color: "var(--ink-tertiary)",
        }}
      >
        <span style={{ writingMode: "vertical-rl", letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.7 }}>
          Z-AXIS
        </span>
        <div
          style={{
            width: 2,
            height: 120,
            background: "var(--line)",
            position: "relative",
            borderRadius: 99,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: `${scrollPercent}%`,
              left: -3,
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "var(--primary)",
              boxShadow: "0 0 8px var(--primary)",
              transform: "translateY(-50%)",
              transition: "top 60ms linear",
            }}
          />
        </div>
        <span style={{ fontWeight: 700, color: "var(--primary)", fontSize: "0.72rem" }}>
          {depthZ}m
        </span>
      </div>

      {/* Bottom Left: Coordinates & Telemetry */}
      <div
        className="hud-module hud-bottom-left"
        style={{
          position: "absolute",
          bottom: 20,
          left: 24,
          fontFamily: "var(--font-mono)",
          fontSize: "0.68rem",
          color: "var(--ink-tertiary)",
          letterSpacing: "0.05em",
        }}
      >
        DEPTH: {depthZ}m &bull; PROGRESS: {scrollPercent}% &bull; DIMENSIONAL_SURFACE: ACTIVE
      </div>

      {/* Bottom Right: Status Signature */}
      <div
        className="hud-module hud-bottom-right"
        style={{
          position: "absolute",
          bottom: 20,
          right: 24,
          fontFamily: "var(--font-mono)",
          fontSize: "0.68rem",
          color: "var(--ink-tertiary)",
          letterSpacing: "0.05em",
        }}
      >
        SEC_ID: GRD-2026-X9 &bull; ENCRYPTED_STATE
      </div>
    </aside>
  );
}
