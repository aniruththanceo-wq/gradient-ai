"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface CareerCapabilityNetworkProps {
  height?: number | string;
  className?: string;
  readinessScore?: number;
  dimensions?: {
    academics?: number;
    aptitude?: number;
    coding?: number;
    communication?: number;
    portfolio?: number;
    skills?: number;
  };
}

export default function CareerCapabilityNetwork({
  height = 240,
  className = "",
  readinessScore = 75,
  dimensions = {
    academics: 80,
    aptitude: 70,
    coding: 65,
    communication: 75,
    portfolio: 70,
    skills: 80,
  },
}: CareerCapabilityNetworkProps) {
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
    const sceneHeight = typeof height === "number" ? height : container.clientHeight || 240;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / sceneHeight, 0.1, 50);
    camera.position.set(0, 0, 4.0);

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

    // 6-Axis Capability Polyhedron
    // Vertices corresponding to 6 dimensions
    const dimValues = [
      (dimensions.academics || 70) / 100,
      (dimensions.aptitude || 70) / 100,
      (dimensions.coding || 70) / 100,
      (dimensions.communication || 70) / 100,
      (dimensions.portfolio || 70) / 100,
      (dimensions.skills || 70) / 100,
    ];

    const vertices: THREE.Vector3[] = [];
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const r = 0.8 + dimValues[i] * 0.7; // scaled distance
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      const z = ((dimValues[i] - 0.5) * 0.5);
      vertices.push(new THREE.Vector3(x, y, z));
    }

    // Connect vertices to create a 3D capability wireframe
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x12634e,
      transparent: true,
      opacity: 0.65,
    });

    const linePoints: number[] = [];
    // Outer perimeter
    for (let i = 0; i < 6; i++) {
      const next = (i + 1) % 6;
      linePoints.push(vertices[i].x, vertices[i].y, vertices[i].z);
      linePoints.push(vertices[next].x, vertices[next].y, vertices[next].z);
      // Connect to center
      linePoints.push(0, 0, 0);
      linePoints.push(vertices[i].x, vertices[i].y, vertices[i].z);
      // Cross diagonals
      const opposite = (i + 3) % 6;
      linePoints.push(vertices[i].x, vertices[i].y, vertices[i].z);
      linePoints.push(vertices[opposite].x, vertices[opposite].y, vertices[opposite].z);
    }

    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute("position", new THREE.Float32BufferAttribute(linePoints, 3));
    const lines = new THREE.LineSegments(lineGeo, lineMat);
    group.add(lines);

    // Vertex Nodes (Glowing Badges)
    const sphereGeo = new THREE.SphereGeometry(0.07, 12, 12);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: 0x197278,
      emissive: 0x12634e,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.8,
    });

    for (let i = 0; i < 6; i++) {
      const mesh = new THREE.Mesh(sphereGeo, sphereMat);
      mesh.position.copy(vertices[i]);
      group.add(mesh);
    }

    // Central core representing unified readiness score
    const centerGeo = new THREE.IcosahedronGeometry(0.28, 1);
    const centerMat = new THREE.MeshStandardMaterial({
      color: readinessScore >= 75 ? 0x12634e : readinessScore >= 60 ? 0xc07817 : 0xb8332c,
      emissive: 0x0c4d3d,
      emissiveIntensity: 0.6,
      wireframe: true,
    });
    const centerMesh = new THREE.Mesh(centerGeo, centerMat);
    group.add(centerMesh);

    // Orbiting capability ring
    const ringGeo = new THREE.TorusGeometry(1.6, 0.01, 16, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x12634e, transparent: true, opacity: 0.3 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    group.add(ring);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x12634e, 3, 6);
    pointLight.position.set(2, 2, 2);
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
        group.rotation.x = Math.sin(elapsed * 0.3) * 0.12;
        centerMesh.rotation.z = -elapsed * 0.3;
        ring.rotation.z = elapsed * 0.1;
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
      const h = typeof height === "number" ? height : container.clientHeight || 240;
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
      lineGeo.dispose();
      lineMat.dispose();
      sphereGeo.dispose();
      sphereMat.dispose();
      centerGeo.dispose();
      centerMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      renderer.dispose();
    };
  }, [isClient, height, readinessScore, dimensions, reducedMotion]);

  return (
    <div
      ref={mountRef}
      className={`career-capability-network-container ${className}`}
      style={{
        width: "100%",
        height: typeof height === "number" ? `${height}px` : height,
        position: "relative",
        overflow: "hidden",
      }}
    />
  );
}
