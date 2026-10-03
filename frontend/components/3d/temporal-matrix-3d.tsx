"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface TemporalMatrix3DProps {
  height?: number | string;
  className?: string;
  examCount?: number;
}

export default function TemporalMatrix3D({
  height = 200,
  className = "",
  examCount = 3,
}: TemporalMatrix3DProps) {
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

    // 1. Concentric Chronological Time Rings
    const ring1Geo = new THREE.TorusGeometry(1.2, 0.015, 16, 64);
    const ring1Mat = new THREE.MeshBasicMaterial({ color: 0x12634e, transparent: true, opacity: 0.5 });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    group.add(ring1);

    const ring2Geo = new THREE.TorusGeometry(0.85, 0.012, 16, 64);
    const ring2Mat = new THREE.MeshBasicMaterial({ color: 0x197278, transparent: true, opacity: 0.4 });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    group.add(ring2);

    const ring3Geo = new THREE.TorusGeometry(0.5, 0.01, 16, 64);
    const ring3Mat = new THREE.MeshBasicMaterial({ color: 0xc07817, transparent: true, opacity: 0.35 });
    const ring3 = new THREE.Mesh(ring3Geo, ring3Mat);
    group.add(ring3);

    // 2. Exam Urgency Nodes on rings
    const nodeCount = Math.max(3, examCount);
    const nodeGeo = new THREE.SphereGeometry(0.09, 12, 12);
    const nodeMat = new THREE.MeshStandardMaterial({
      color: 0x12634e,
      emissive: 0x12634e,
      emissiveIntensity: 0.7,
      roughness: 0.2,
      metalness: 0.8,
    });

    const nodes: THREE.Mesh[] = [];
    for (let i = 0; i < nodeCount; i++) {
      const angle = (i / nodeCount) * Math.PI * 2;
      const r = i % 2 === 0 ? 1.2 : 0.85;
      const mesh = new THREE.Mesh(nodeGeo, nodeMat);
      mesh.position.set(Math.cos(angle) * r, Math.sin(angle) * r, (Math.random() - 0.5) * 0.2);
      group.add(mesh);
      nodes.push(mesh);
    }

    // 3. Central Clock/Matrix Indicator
    const centerGeo = new THREE.IcosahedronGeometry(0.25, 0);
    const centerMat = new THREE.MeshStandardMaterial({
      color: 0x197278,
      emissive: 0x0c4d3d,
      emissiveIntensity: 0.5,
      wireframe: true,
    });
    const centerMesh = new THREE.Mesh(centerGeo, centerMat);
    group.add(centerMesh);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x12634e, 3, 6);
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
        ring1.rotation.z = elapsed * 0.2;
        ring2.rotation.z = -elapsed * 0.25;
        ring3.rotation.z = elapsed * 0.35;
        group.rotation.x = Math.PI / 6 + Math.sin(elapsed * 0.5) * 0.08;
        group.rotation.y = elapsed * 0.15;
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
      ring1Geo.dispose();
      ring1Mat.dispose();
      ring2Geo.dispose();
      ring2Mat.dispose();
      ring3Geo.dispose();
      ring3Mat.dispose();
      nodeGeo.dispose();
      nodeMat.dispose();
      centerGeo.dispose();
      centerMat.dispose();
      renderer.dispose();
    };
  }, [isClient, height, examCount, reducedMotion]);

  return (
    <div
      ref={mountRef}
      className={`temporal-matrix-container ${className}`}
      style={{
        width: "100%",
        height: typeof height === "number" ? `${height}px` : height,
        position: "relative",
        overflow: "hidden",
      }}
    />
  );
}
