"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import * as THREE from "three";
import { OceanWorld, type WorldUpdateParams } from "./worlds/ocean-world";
import { MountainWorld } from "./worlds/mountain-world";
import { ForestWorld } from "./worlds/forest-world";
import { VolcanoWorld } from "./worlds/volcano-world";
import { SolarWorld } from "./worlds/solar-world";

interface SpatialWorldProps {
  className?: string;
}

interface WorldInstance {
  group: THREE.Group;
  update: (params: WorldUpdateParams) => void;
  dispose: () => void;
}

export default function SpatialWorld({ className = "" }: SpatialWorldProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (!isClient || !containerRef.current) return;

    const container = containerRef.current;
    let width = window.innerWidth;
    let height = window.innerHeight;
    const isMobile = width < 768;

    // 1. Scene & Perspective Camera
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030709, 0.0038);

    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
    camera.position.set(0, 0, 40);

    // 2. High-Performance WebGL Renderer with ACES Filmic Tone Mapping
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isMobile,
        alpha: true,
        powerPreference: "high-performance",
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.setClearColor(0x000000, 0);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
      container.appendChild(renderer.domElement);
    } catch {
      return;
    }

    // 3. Dynamic Route-Specific Cinematic World Instantiation
    let activeWorld: WorldInstance;
    if (pathname === "/") {
      activeWorld = new OceanWorld(scene, camera, isMobile);
    } else if (pathname === "/dashboard") {
      activeWorld = new MountainWorld(scene, camera, isMobile);
    } else if (pathname === "/academic") {
      activeWorld = new ForestWorld(scene, camera, isMobile);
    } else if (pathname === "/placement") {
      activeWorld = new VolcanoWorld(scene, camera, isMobile);
    } else {
      activeWorld = new SolarWorld(scene, camera, isMobile);
    }

    // 4. Smooth Interaction & Camera Physics
    let scrollProgress = 0;
    let lastScrollY = window.scrollY;
    let scrollVelocity = 0;
    let mouseX = 0;
    let mouseY = 0;
    let isVisible = true;
    let animationFrameId: number;

    const computeScroll = () => {
      const docHeight = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        1
      );
      const currentScrollY = window.scrollY;
      scrollProgress = Math.min(Math.max(currentScrollY / docHeight, 0), 1);
      scrollVelocity = (currentScrollY - lastScrollY) / 16;
      lastScrollY = currentScrollY;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouseX = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
        mouseY = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
      }
    };

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    };

    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
    };

    window.addEventListener("scroll", computeScroll, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("resize", handleResize);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    computeScroll();

    // 5. Cinematic Render Loop
    const clock = new THREE.Clock();
    const renderLoop = () => {
      animationFrameId = requestAnimationFrame(renderLoop);
      if (!isVisible) return;

      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();

      // Velocity damping
      scrollVelocity *= 0.92;

      activeWorld.update({
        scrollProgress,
        scrollVelocity,
        mouseX,
        mouseY,
        delta,
        elapsed,
        reducedMotion,
        isMobile,
      });

      renderer.render(scene, camera);
    };

    renderLoop();

    // 6. Complete Clean Lifecycle Disposal
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("scroll", computeScroll);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);

      activeWorld.dispose();
      renderer.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isClient, pathname, reducedMotion]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`fixed inset-0 pointer-events-none z-0 overflow-hidden ${className}`}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}
