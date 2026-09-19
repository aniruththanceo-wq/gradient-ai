"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface AcademicHealthOrbProps {
  cgpa?: number;
  riskLevel?: string;
  size?: number;
  className?: string;
}

export default function AcademicHealthOrb({
  cgpa = 8.0,
  riskLevel = "Low Risk",
  size = 140,
  className = "",
}: AcademicHealthOrbProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Color mapping based on risk level and CGPA
  const isHighRisk = riskLevel.toLowerCase().includes("high") || riskLevel.toLowerCase().includes("critical");
  const isModerateRisk = riskLevel.toLowerCase().includes("moderate");

  const primaryHex = isHighRisk ? 0xb8332c : isModerateRisk ? 0xc07817 : 0x12634e;
  const glowHex = isHighRisk ? 0xfaebea : isModerateRisk ? 0xfbf2e3 : 0x22a07c;

  useEffect(() => {
    setIsClient(true);
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);
    const handler = (event: MediaQueryListEvent) => setReducedMotion(event.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (!isClient || !mountRef.current) return;

    const container = mountRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 50);
    camera.position.z = 3.2;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
      renderer.setSize(size, size);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.setClearColor(0x000000, 0);
      container.appendChild(renderer.domElement);
    } catch {
      return;
    }

    // Geometry & Material
    const geometry = new THREE.IcosahedronGeometry(0.85, 1);
    const material = new THREE.MeshStandardMaterial({
      color: primaryHex,
      emissive: primaryHex,
      emissiveIntensity: 0.35,
      roughness: 0.3,
      metalness: 0.7,
      wireframe: true,
    });
    const orb = new THREE.Mesh(geometry, material);
    scene.add(orb);

    // Inner core
    const innerGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const innerMaterial = new THREE.MeshBasicMaterial({
      color: glowHex,
      transparent: true,
      opacity: 0.6,
    });
    const innerCore = new THREE.Mesh(innerGeometry, innerMaterial);
    scene.add(innerCore);

    // Light
    const light = new THREE.PointLight(primaryHex, 3, 5);
    light.position.set(2, 2, 2);
    scene.add(light);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    let frameId: number;
    const startedAt = performance.now();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const elapsed = (performance.now() - startedAt) / 1000;
      if (!reducedMotion) {
        orb.rotation.y = elapsed * 0.4;
        orb.rotation.x = elapsed * 0.2;
        innerCore.rotation.y = -elapsed * 0.3;

        const pulse = 1 + Math.sin(elapsed * 2) * 0.04;
        orb.scale.set(pulse, pulse, pulse);
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameId);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      innerGeometry.dispose();
      innerMaterial.dispose();
      renderer.dispose();
    };
  }, [isClient, size, primaryHex, glowHex, reducedMotion]);

  return (
    <div
      ref={mountRef}
      className={`academic-health-orb ${className}`}
      style={{ width: size, height: size, position: "relative" }}
    />
  );
}
