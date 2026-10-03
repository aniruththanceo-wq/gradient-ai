"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface AssessmentMatrix3DProps {
  height?: number | string;
  className?: string;
  assessmentType?: "aptitude" | "coding" | "communication";
  progressPercentage?: number;
}

export default function AssessmentMatrix3D({
  height = 180,
  className = "",
  assessmentType = "aptitude",
  progressPercentage = 0,
}: AssessmentMatrix3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
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
    if (!isClient || !mountRef.current) return;

    const container = mountRef.current;
    const width = container.clientWidth || 260;
    const sceneHeight = typeof height === "number" ? height : container.clientHeight || 180;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / sceneHeight, 0.1, 50);
    camera.position.set(0, 0, 3.6);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
      renderer.setSize(width, sceneHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.setClearColor(0x000000, 0);
      container.appendChild(renderer.domElement);
    } catch {
      return;
    }

    const group = new THREE.Group();
    scene.add(group);

    // Color by domain
    const primaryHex =
      assessmentType === "coding"
        ? 0x12634e
        : assessmentType === "communication"
        ? 0x3b5998
        : 0x197278;

    // 1. Crystal Neural Core
    const coreGeo = new THREE.OctahedronGeometry(0.85, 1);
    const coreMat = new THREE.MeshStandardMaterial({
      color: primaryHex,
      emissive: primaryHex,
      emissiveIntensity: 0.45,
      roughness: 0.25,
      wireframe: true,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    group.add(core);

    // 2. Inner Glowing Core
    const innerGeo = new THREE.SphereGeometry(0.45, 16, 16);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x22a07c,
      transparent: true,
      opacity: 0.4 + (progressPercentage / 100) * 0.4,
    });
    const inner = new THREE.Mesh(innerGeo, innerMat);
    group.add(inner);

    // 3. Progress Orbit Ring
    const ringGeo = new THREE.TorusGeometry(1.25, 0.015, 16, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: primaryHex,
      transparent: true,
      opacity: 0.6,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 4;
    group.add(ring);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(primaryHex, 3, 6);
    pointLight.position.set(1.5, 1.5, 2);
    scene.add(pointLight);

    let frameId: number | undefined;
    let isVisible = true;
    let disposed = false;
    const startedAt = performance.now();

    const animate = () => {
      if (disposed || !isVisible || document.hidden) {
        frameId = undefined;
        return;
      }

      const elapsed = (performance.now() - startedAt) / 1000;
      if (!reducedMotion) {
        core.rotation.y = elapsed * 0.35;
        core.rotation.x = elapsed * 0.15;
        inner.rotation.y = -elapsed * 0.25;
        ring.rotation.z = elapsed * 0.2;
        const pulse = 1 + Math.sin(elapsed * 2) * 0.03;
        core.scale.set(pulse, pulse, pulse);
      }

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };

    const stopRendering = () => {
      if (frameId !== undefined) cancelAnimationFrame(frameId);
      frameId = undefined;
    };
    const startRendering = () => {
      if (disposed || !isVisible || document.hidden) return;
      if (reducedMotion) renderer.render(scene, camera);
      else if (frameId === undefined) frameId = requestAnimationFrame(animate);
    };

    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      if (isVisible) startRendering();
      else stopRendering();
    });
    const handleVisibilityChange = () => {
      if (document.hidden) stopRendering();
      else startRendering();
    };

    observer.observe(container);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    startRendering();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 260;
      const h = typeof height === "number" ? height : container.clientHeight || 180;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      disposed = true;
      stopRendering();
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      coreGeo.dispose();
      coreMat.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      renderer.dispose();
    };
  }, [isClient, height, assessmentType, progressPercentage, reducedMotion]);

  return (
    <div
      ref={mountRef}
      className={`assessment-matrix-container ${className}`}
      style={{
        width: "100%",
        height: typeof height === "number" ? `${height}px` : height,
        position: "relative",
        overflow: "hidden",
      }}
    />
  );
}
