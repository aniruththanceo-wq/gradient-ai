"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface TrajectoryNetworkProps {
  height?: number | string;
  className?: string;
  subjectsCount?: number;
  averageTrend?: "improving" | "stable" | "declining" | "fluctuating";
}

export default function TrajectoryNetwork({
  height = 220,
  className = "",
  subjectsCount = 4,
  averageTrend = "improving",
}: TrajectoryNetworkProps) {
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
    const width = container.clientWidth || 300;
    const sceneHeight = typeof height === "number" ? height : container.clientHeight || 220;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / sceneHeight, 0.1, 50);
    camera.position.set(0, 0, 4.2);

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

    // Color theme based on trend
    const primaryHex = averageTrend === "declining" ? 0xb8332c : averageTrend === "stable" ? 0x197278 : 0x12634e;
    const accentHex = averageTrend === "declining" ? 0xc07817 : 0x22a07c;

    // Node & Edge Graph (Subject Trajectory Lattice)
    const nodeGroup = new THREE.Group();
    scene.add(nodeGroup);

    const nodeCount = Math.max(6, subjectsCount * 2);
    const nodePositions: THREE.Vector3[] = [];
    const nodeSpheres: THREE.Mesh[] = [];

    const sphereGeo = new THREE.SphereGeometry(0.08, 12, 12);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: primaryHex,
      emissive: primaryHex,
      emissiveIntensity: 0.6,
      roughness: 0.3,
      metalness: 0.8,
    });

    for (let i = 0; i < nodeCount; i++) {
      const angle = (i / nodeCount) * Math.PI * 2;
      const radius = 1.2 + (i % 2 === 0 ? 0.35 : -0.25);
      const y = ((i / (nodeCount - 1)) - 0.5) * 1.6;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius * 0.7;

      const pos = new THREE.Vector3(x, y, z);
      nodePositions.push(pos);

      const mesh = new THREE.Mesh(sphereGeo, sphereMat);
      mesh.position.copy(pos);
      nodeGroup.add(mesh);
      nodeSpheres.push(mesh);
    }

    // Connect nodes with dynamic trajectory lines
    const lineMat = new THREE.LineBasicMaterial({
      color: accentHex,
      transparent: true,
      opacity: 0.4,
    });

    const lineGeo = new THREE.BufferGeometry();
    const lineIndices: number[] = [];
    for (let i = 0; i < nodeCount - 1; i++) {
      lineIndices.push(nodePositions[i].x, nodePositions[i].y, nodePositions[i].z);
      lineIndices.push(nodePositions[i + 1].x, nodePositions[i + 1].y, nodePositions[i + 1].z);
      if (i + 2 < nodeCount) {
        lineIndices.push(nodePositions[i].x, nodePositions[i].y, nodePositions[i].z);
        lineIndices.push(nodePositions[i + 2].x, nodePositions[i + 2].y, nodePositions[i + 2].z);
      }
    }
    lineGeo.setAttribute("position", new THREE.Float32BufferAttribute(lineIndices, 3));
    const lines = new THREE.LineSegments(lineGeo, lineMat);
    nodeGroup.add(lines);

    // Central anchor core
    const centerGeo = new THREE.OctahedronGeometry(0.35, 0);
    const centerMat = new THREE.MeshStandardMaterial({
      color: 0x12634e,
      emissive: 0x0c4d3d,
      emissiveIntensity: 0.5,
      wireframe: true,
    });
    const centerMesh = new THREE.Mesh(centerGeo, centerMat);
    nodeGroup.add(centerMesh);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(primaryHex, 3, 8);
    pointLight.position.set(2, 2, 3);
    scene.add(pointLight);

    // Animation & Lifecycle
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
        nodeGroup.rotation.y = elapsed * 0.25;
        nodeGroup.rotation.x = Math.sin(elapsed * 0.4) * 0.1;
        centerMesh.rotation.z = -elapsed * 0.3;
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
      const w = container.clientWidth || 300;
      const h = typeof height === "number" ? height : container.clientHeight || 220;
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
      sphereGeo.dispose();
      sphereMat.dispose();
      lineGeo.dispose();
      lineMat.dispose();
      centerGeo.dispose();
      centerMat.dispose();
      renderer.dispose();
    };
  }, [isClient, height, subjectsCount, averageTrend, reducedMotion]);

  return (
    <div
      ref={mountRef}
      className={`trajectory-network-container ${className}`}
      style={{
        width: "100%",
        height: typeof height === "number" ? `${height}px` : height,
        position: "relative",
        overflow: "hidden",
      }}
    />
  );
}
