"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface AIIntelligenceCoreProps {
  className?: string;
  height?: number | string;
  interactive?: boolean;
}

export default function AIIntelligenceCore({
  className = "",
  height = 420,
  interactive = true,
}: AIIntelligenceCoreProps) {
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
    const width = container.clientWidth || 400;
    const sceneHeight = typeof height === "number" ? height : container.clientHeight || 420;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / sceneHeight, 0.1, 100);
    camera.position.z = 4.8;

    // 2. WebGL Renderer (optimized DPR, antialias, alpha)
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
      // WebGL not supported fallback
      return;
    }

    // 3. Central AI Neural Mesh (Icosahedron Core + Wireframe)
    const coreGeometry = new THREE.IcosahedronGeometry(1.35, 2);
    const coreMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x12634e, // Forest Emerald
      emissive: 0x0c4d3d,
      emissiveIntensity: 0.4,
      roughness: 0.2,
      metalness: 0.85,
      wireframe: true,
      transparent: true,
      opacity: 0.65,
    });
    const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
    scene.add(coreMesh);

    // Inner glowing sphere
    const innerGeometry = new THREE.SphereGeometry(0.7, 24, 24);
    const innerMaterial = new THREE.MeshStandardMaterial({
      color: 0x197278, // Deep Teal
      emissive: 0x12634e,
      emissiveIntensity: 0.8,
      roughness: 0.4,
      metalness: 0.6,
      transparent: true,
      opacity: 0.85,
    });
    const innerMesh = new THREE.Mesh(innerGeometry, innerMaterial);
    scene.add(innerMesh);

    // 4. Orbiting Rings (Data trajectories)
    const ring1Geometry = new THREE.TorusGeometry(1.95, 0.015, 16, 100);
    const ring1Material = new THREE.MeshBasicMaterial({
      color: 0x12634e,
      transparent: true,
      opacity: 0.45,
    });
    const ring1 = new THREE.Mesh(ring1Geometry, ring1Material);
    ring1.rotation.x = Math.PI / 3;
    scene.add(ring1);

    const ring2Geometry = new THREE.TorusGeometry(2.2, 0.012, 16, 100);
    const ring2Material = new THREE.MeshBasicMaterial({
      color: 0x197278,
      transparent: true,
      opacity: 0.35,
    });
    const ring2 = new THREE.Mesh(ring2Geometry, ring2Material);
    ring2.rotation.x = -Math.PI / 4;
    ring2.rotation.y = Math.PI / 6;
    scene.add(ring2);

    // 5. Data Node Particle Cloud
    const particleCount = 120;
    const particlePositions = new Float32Array(particleCount * 3);
    const radiusRange = 2.8;

    for (let i = 0; i < particleCount * 3; i += 3) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 1.4 + Math.cbrt(Math.random()) * (radiusRange - 1.4);
      const sinPhi = Math.sin(phi);

      particlePositions[i] = r * sinPhi * Math.cos(theta);
      particlePositions[i + 1] = r * sinPhi * Math.sin(theta);
      particlePositions[i + 2] = r * Math.cos(phi);
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));

    const particleMaterial = new THREE.PointsMaterial({
      color: 0x22a07c,
      size: 0.055,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // 6. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x12634e, 3.5, 10);
    pointLight1.position.set(3, 3, 3);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x197278, 2.5, 10);
    pointLight2.position.set(-3, -2, 2);
    scene.add(pointLight2);

    // 7. Mouse Interaction / Parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handlePointerMove = (event: PointerEvent) => {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      mouseX = (x / rect.width) * 0.8;
      mouseY = -(y / rect.height) * 0.8;
    };

    if (interactive) {
      container.addEventListener("pointermove", handlePointerMove);
    }

    // 8. Visibility / Performance Observer
    let isVisible = true;
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    });
    observer.observe(container);

    // 9. Resize Handling
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth || 400;
      const newHeight = typeof height === "number" ? height : container.clientHeight || 420;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener("resize", handleResize);

    // 10. Animation Loop
    let animationFrameId: number;
    const startedAt = performance.now();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isVisible) return;

      const elapsedTime = (performance.now() - startedAt) / 1000;

      if (!reducedMotion) {
        // Slow organic rotation
        coreMesh.rotation.y = elapsedTime * 0.15;
        coreMesh.rotation.x = elapsedTime * 0.08;

        innerMesh.rotation.y = -elapsedTime * 0.2;

        ring1.rotation.z = elapsedTime * 0.1;
        ring2.rotation.z = -elapsedTime * 0.12;

        particles.rotation.y = elapsedTime * 0.04;
        particles.rotation.x = elapsedTime * 0.02;

        // Subtle floating pulsation
        const pulse = 1 + Math.sin(elapsedTime * 1.5) * 0.03;
        coreMesh.scale.set(pulse, pulse, pulse);
      }

      // Smooth mouse parallax damping
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      camera.position.x = targetX * 0.8;
      camera.position.y = targetY * 0.8;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    // 11. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
      if (interactive) {
        container.removeEventListener("pointermove", handlePointerMove);
      }
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      // Dispose Three.js resources
      coreGeometry.dispose();
      coreMaterial.dispose();
      innerGeometry.dispose();
      innerMaterial.dispose();
      ring1Geometry.dispose();
      ring1Material.dispose();
      ring2Geometry.dispose();
      ring2Material.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      renderer.dispose();
    };
  }, [isClient, height, interactive, reducedMotion]);

  return (
    <div
      ref={mountRef}
      className={`ai-core-container ${className}`}
      style={{
        width: "100%",
        height: typeof height === "number" ? `${height}px` : height,
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    />
  );
}
