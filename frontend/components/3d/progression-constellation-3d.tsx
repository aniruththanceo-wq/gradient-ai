"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface ProgressionConstellation3DProps {
  height?: number | string;
  className?: string;
  currentStep?: number;
  academicYear?: number;
}

export default function ProgressionConstellation3D({
  height = 200,
  className = "",
  currentStep = 1,
  academicYear = 1,
}: ProgressionConstellation3DProps) {
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
    const width = container.clientWidth || 280;
    const sceneHeight = typeof height === "number" ? height : container.clientHeight || 200;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / sceneHeight, 0.1, 50);
    camera.position.set(0, 0, 3.8);

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

    const isSenior = academicYear >= 3;
    const primaryHex = isSenior ? 0x12634e : 0x197278;

    // 1. Core Constellation Nexus
    const coreGeo = new THREE.DodecahedronGeometry(currentStep === 1 ? 0.5 : 0.7, 0);
    const coreMat = new THREE.MeshStandardMaterial({
      color: primaryHex,
      emissive: primaryHex,
      emissiveIntensity: 0.5,
      roughness: 0.3,
      wireframe: true,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    group.add(core);

    // 2. Surrounding Constellation Starfield Nodes
    const starCount = 30;
    const starGeo = new THREE.SphereGeometry(0.035, 8, 8);
    const starMat = new THREE.MeshBasicMaterial({ color: 0x22a07c });
    const stars: THREE.Mesh[] = [];
    const starPositions: THREE.Vector3[] = [];

    for (let i = 0; i < starCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 1.0 + Math.random() * 0.8;

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      const pos = new THREE.Vector3(x, y, z);
      starPositions.push(pos);

      const mesh = new THREE.Mesh(starGeo, starMat);
      mesh.position.copy(pos);
      group.add(mesh);
      stars.push(mesh);
    }

    // 3. Constellation Lines
    const lineIndices: number[] = [];
    for (let i = 0; i < starCount; i += 2) {
      if (i + 1 < starCount) {
        lineIndices.push(starPositions[i].x, starPositions[i].y, starPositions[i].z);
        lineIndices.push(starPositions[i + 1].x, starPositions[i + 1].y, starPositions[i + 1].z);
      }
    }
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute("position", new THREE.Float32BufferAttribute(lineIndices, 3));
    const lineMat = new THREE.LineBasicMaterial({ color: 0x12634e, transparent: true, opacity: 0.3 });
    const lines = new THREE.LineSegments(lineGeo, lineMat);
    group.add(lines);

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
        group.rotation.y = elapsed * 0.2;
        group.rotation.x = Math.sin(elapsed * 0.3) * 0.1;
        core.rotation.z = -elapsed * 0.25;
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
      const w = container.clientWidth || 280;
      const h = typeof height === "number" ? height : container.clientHeight || 200;
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
      starGeo.dispose();
      starMat.dispose();
      lineGeo.dispose();
      lineMat.dispose();
      renderer.dispose();
    };
  }, [isClient, height, currentStep, academicYear, reducedMotion]);

  return (
    <div
      ref={mountRef}
      className={`progression-constellation-container ${className}`}
      style={{
        width: "100%",
        height: typeof height === "number" ? `${height}px` : height,
        position: "relative",
        overflow: "hidden",
      }}
    />
  );
}
