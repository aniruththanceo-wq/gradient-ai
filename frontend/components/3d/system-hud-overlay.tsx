"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function SystemHudOverlay() {
  const pathname = usePathname();
  const [scrollPercent, setScrollPercent] = useState(0);
  const [sectorName, setSectorName] = useState("EXPEDITION 01: OCEAN SURFACE");
  const [depthZ, setDepthZ] = useState(15);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, scrollY / maxScroll));
      setScrollPercent(Math.round(progress * 100));

      if (pathname === "/academic") {
        setSectorName("EXPEDITION: CANOPY WOODLAND // LIVING FOREST ROAD");
        setDepthZ(Math.round(25 - progress * 240));
      } else if (pathname === "/placement") {
        setSectorName("EXPEDITION: VOLCANIC CALDERA // MAGMA CORE DESCENT");
        setDepthZ(Math.round(15 - progress * 130));
      } else if (pathname === "/dashboard") {
        setSectorName("COMMAND DECK: GLACIAL SUMMIT // MOUNTAIN DESCENT");
        setDepthZ(Math.round(20 - progress * 130));
      } else if (pathname === "/reports") {
        setSectorName("OBSERVATORY: PLANETARY ARCHIVE // DOSSIER VAULT");
        setDepthZ(Math.round(50 - progress * 160));
      } else if (pathname === "/onboarding") {
        setSectorName("COSMIC TRAJECTORY: SOLAR SYSTEM ARRIVAL");
        setDepthZ(Math.round(50 - progress * 160));
      } else {
        // Landing page ocean descent stages
        if (progress < 0.15) {
          setSectorName("EXPEDITION: OCEAN SURFACE // RESEARCH VESSEL");
          setDepthZ(Math.round(15 - progress * 30));
        } else if (progress < 0.55) {
          setSectorName("EXPEDITION: SUNLIT SHALLOWS // MARINE LIFE ECOSYSTEM");
          setDepthZ(Math.round(10 - progress * 90));
        } else if (progress < 0.85) {
          setSectorName("EXPEDITION: ABYSSAL DEEP // BIOLUMINESCENT TRENCH");
          setDepthZ(Math.round(-40 - progress * 70));
        } else {
          setSectorName("EXPEDITION: DEEP TRENCH // PREHISTORIC ABYSS");
          setDepthZ(Math.round(-100 - progress * 25));
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
        <span>GRADIENT_CORE // WORLD.ACTIVE // SYNC: 99.8%</span>
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
          color: "var(--primary)",
          letterSpacing: "0.08em",
          padding: "4px 10px",
          background: "rgba(16, 185, 129, 0.08)",
          border: "1px solid rgba(16, 185, 129, 0.28)",
          borderRadius: 4,
        }}
      >
        <span>{sectorName}</span>
      </div>

      {/* Right: Environmental Depth Meter */}
      <div
        className="hud-module hud-right-meter"
        style={{
          position: "absolute",
          top: "50%",
          right: 24,
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
        <span style={{ writingMode: "vertical-rl", letterSpacing: "0.1em" }}>
          ALTITUDE / DEPTH
        </span>
        <div
          style={{
            width: 2,
            height: 120,
            background: "rgba(255, 255, 255, 0.12)",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: `${scrollPercent}%`,
              left: -3,
              width: 8,
              height: 2,
              background: "var(--primary)",
              boxShadow: "0 0 6px var(--primary)",
              transition: "top 60ms linear",
            }}
          />
        </div>
        <span style={{ color: "var(--primary)", fontWeight: 700 }}>
          {depthZ}m
        </span>
      </div>

      {/* Bottom Left: Spatial Telemetry */}
      <div
        className="hud-module hud-bottom-left"
        style={{
          position: "absolute",
          bottom: 24,
          left: 24,
          display: "flex",
          gap: 12,
          fontFamily: "var(--font-mono)",
          fontSize: "0.68rem",
          color: "var(--ink-tertiary)",
        }}
      >
        <span className="system-chip">FPS // 60</span>
        <span className="system-chip">NAV // SPATIAL_DAMPED</span>
        <span className="system-chip">SURFACE // GLASS_OBSIDIAN</span>
      </div>

      {/* Bottom Right: Travel Progression */}
      <div
        className="hud-module hud-bottom-right"
        style={{
          position: "absolute",
          bottom: 24,
          right: 24,
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontFamily: "var(--font-mono)",
          fontSize: "0.72rem",
          color: "var(--ink-secondary)",
        }}
      >
        <span>JOURNEY PROGRESS</span>
        <div
          style={{
            width: 80,
            height: 4,
            background: "rgba(255, 255, 255, 0.12)",
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${scrollPercent}%`,
              height: "100%",
              background: "var(--primary)",
              boxShadow: "0 0 6px var(--primary)",
              transition: "width 60ms linear",
            }}
          />
        </div>
        <span style={{ color: "var(--primary)", fontWeight: 700 }}>
          {scrollPercent}%
        </span>
      </div>
    </aside>
  );
}
