"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface DocumentMatrix3DProps {
  height?: number | string;
  className?: string;
  reportType?: "academic" | "placement" | "executive";
}

export default function DocumentMatrix3D({
  height = 200,
  className = "",
  reportType = "academic",
}: DocumentMatrix3DProps) {
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

    const primaryHex = reportType === "placement" ? 0x197278 : 0x12634e;
    const glowHex = reportType === "placement" ? 0x3b5998 : 0x22a07c;

    // 1. Holographic Dossier Crystal (Box with rounded proportions)
    const boxGeo = new THREE.BoxGeometry(1.1, 1.4, 0.15);
    const boxMat = new THREE.MeshStandardMaterial({
      color: primaryHex,
      emissive: primaryHex,
      emissiveIntensity: 0.35,
      roughness: 0.2,
      metalness: 0.8,
      wireframe: true,
    });
    const box = new THREE.Mesh(boxGeo, boxMat);
    group.add(box);

    // Inner translucent layer
    const innerBoxGeo = new THREE.BoxGeometry(0.95, 1.25, 0.08);
    const innerBoxMat = new THREE.MeshBasicMaterial({
      color: glowHex,
      transparent: true,
      opacity: 0.3,
    });
    const innerBox = new THREE.Mesh(innerBoxGeo, innerBoxMat);
    group.add(innerBox);

    // 2. Data Telemetry Nodes orbiting dossier
    const nodeCount = 8;
    const nodeGeo = new THREE.SphereGeometry(0.04, 8, 8);
    const nodeMat = new THREE.MeshBasicMaterial({ color: 0x22a07c });
    const nodes: THREE.Mesh[] = [];

    for (let i = 0; i < nodeCount; i++) {
      const mesh = new THREE.Mesh(nodeGeo, nodeMat);
      const angle = (i / nodeCount) * Math.PI * 2;
      mesh.position.set(Math.cos(angle) * 1.0, Math.sin(angle) * 1.0, (Math.random() - 0.5) * 0.4);
      group.add(mesh);
      nodes.push(mesh);
    }

    // 3. Document Verification Stamp Ring
    const ringGeo = new THREE.TorusGeometry(0.35, 0.015, 16, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xc07817, transparent: true, opacity: 0.7 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.set(0, 0, 0.12);
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
        group.rotation.y = elapsed * 0.3;
        group.rotation.x = Math.sin(elapsed * 0.4) * 0.1;
        ring.rotation.z = -elapsed * 0.5;
        nodes.forEach((n, idx) => {
          const a = elapsed * 0.4 + (idx / nodeCount) * Math.PI * 2;
          n.position.x = Math.cos(a) * 0.95;
          n.position.y = Math.sin(a) * 0.95;
        });
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
      boxGeo.dispose();
      boxMat.dispose();
      innerBoxGeo.dispose();
      innerBoxMat.dispose();
      nodeGeo.dispose();
      nodeMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      renderer.dispose();
    };
  }, [isClient, height, reportType, reducedMotion]);

  return (
    <div
      ref={mountRef}
      className={`document-matrix-container ${className}`}
      style={{
        width: "100%",
        height: typeof height === "number" ? `${height}px` : height,
        position: "relative",
        overflow: "hidden",
      }}
    />
  );
}
