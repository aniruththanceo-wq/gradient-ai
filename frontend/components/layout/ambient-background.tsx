"use client";

import React from "react";
import dynamic from "next/dynamic";
import { SystemHudOverlay } from "@/components/3d/system-hud-overlay";

// Dynamically load SpatialWorld with SSR false
const SpatialWorld = dynamic(() => import("@/components/3d/spatial-world"), {
  ssr: false,
  loading: () => null,
});

export function AmbientBackground() {
  return (
    <>
      {/* 1. Persistent Route-Driven 3D Three.js Cinematic World */}
      <SpatialWorld />

      {/* 2. High-Tech System HUD Telemetry Overlay */}
      <SystemHudOverlay />

      {/* 3. Ambient Atmospheric Depth Backdrop */}
      <div
        className="ambient-bg-system"
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          pointerEvents: "none",
          zIndex: -1,
          overflow: "hidden",
        }}
      >
        {/* Top Cyber Emerald Radial Glow */}
        <div
          style={{
            position: "absolute",
            top: "-15%",
            left: "15%",
            width: "60vw",
            height: "50vw",
            background:
              "radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, rgba(16, 185, 129, 0) 70%)",
            filter: "blur(70px)",
          }}
        />

        {/* Right Ice Cyan Horizon Light */}
        <div
          style={{
            position: "absolute",
            top: "40%",
            right: "-10%",
            width: "50vw",
            height: "50vw",
            background:
              "radial-gradient(circle, rgba(6, 182, 212, 0.1) 0%, rgba(6, 182, 212, 0) 70%)",
            filter: "blur(60px)",
          }}
        />

        {/* Fine Deep Space Dot Matrix Overlay */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundImage:
              "radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px)",
            backgroundSize: "36px 36px",
            opacity: 0.85,
          }}
        />
      </div>
    </>
  );
}
