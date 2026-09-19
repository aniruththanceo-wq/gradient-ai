"use client";

import React from "react";

export function AmbientBackground() {
  return (
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
      {/* Top Emerald Radial Glow */}
      <div
        style={{
          position: "absolute",
          top: "-15%",
          left: "20%",
          width: "55vw",
          height: "45vw",
          background: "radial-gradient(circle, rgba(18, 99, 78, 0.07) 0%, rgba(18, 99, 78, 0) 70%)",
          filter: "blur(60px)",
        }}
      />

      {/* Right Cyber Teal Ambient Light */}
      <div
        style={{
          position: "absolute",
          top: "35%",
          right: "-10%",
          width: "45vw",
          height: "45vw",
          background: "radial-gradient(circle, rgba(25, 114, 120, 0.05) 0%, rgba(25, 114, 120, 0) 70%)",
          filter: "blur(50px)",
        }}
      />

      {/* Subtle fine dot grid overlay */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage:
            "radial-gradient(rgba(15, 25, 23, 0.04) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          opacity: 0.8,
        }}
      />
    </div>
  );
}
