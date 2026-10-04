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
      {/* 1. Persistent 3D Three.js Spatial Universe */}
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
        {/* Top Emerald Radial Atmospheric Glow */}
        <div
          style={{
            position: "absolute",
            top: "-15%",
            left: "15%",
            width: "60vw",
            height: "50vw",
            background: "radial-gradient(circle, rgba(18, 99, 78, 0.09) 0%, rgba(18, 99, 78, 0) 70%)",
            filter: "blur(70px)",
          }}
        />

        {/* Right Cyber Teal Horizon Light */}
        <div
          style={{
            position: "absolute",
            top: "40%",
            right: "-10%",
            width: "50vw",
            height: "50vw",
            background: "radial-gradient(circle, rgba(25, 114, 120, 0.07) 0%, rgba(25, 114, 120, 0) 70%)",
            filter: "blur(60px)",
          }}
        />

        {/* Fine Reticle Dot Matrix Overlay */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundImage:
              "radial-gradient(rgba(18, 99, 78, 0.06) 1px, transparent 1px)",
            backgroundSize: "36px 36px",
            opacity: 0.85,
          }}
        />
      </div>
    </>
  );
}
