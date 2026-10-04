"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import type { SpatialEventDetail } from "@/lib/spatial-events";

interface SpatialWorldProps {
  className?: string;
}

export default function SpatialWorld({ className = "" }: SpatialWorldProps) {
  const containerRef = useRef<HTMLDivElement>(null);
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

    // Detect mobile/tablet for performance scaling
    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 1024;
    const particleMultiplier = isMobile ? 0.35 : isTablet ? 0.65 : 1.0;

    // 1. Scene, Camera & Fog
    const scene = new THREE.Scene();
    // Atmospheric perspective fog — deep dark pine/emerald
    scene.fog = new THREE.FogExp2(0x071512, 0.0032);

    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
    camera.position.set(0, 0, 45);

    // 2. WebGL Renderer
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
      container.appendChild(renderer.domElement);
    } catch {
      return;
    }

    // 3. Lighting Architecture
    const ambientLight = new THREE.AmbientLight(0x0f2d24, 1.8);
    scene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0x10b981, 2.2);
    directionalLight1.position.set(20, 40, 20);
    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0x06b6d4, 1.4);
    directionalLight2.position.set(-20, -30, -50);
    scene.add(directionalLight2);

    const pointLight = new THREE.PointLight(0x34d399, 2.0, 120);
    pointLight.position.set(0, 0, 0);
    scene.add(pointLight);

    // =========================================================================
    // LAYER A — FAR DISTANCE: Cosmic Constellation & Enormous Intelligence Gates
    // =========================================================================
    const farCount = Math.floor(900 * particleMultiplier);
    const farGeo = new THREE.BufferGeometry();
    const farPositions = new Float32Array(farCount * 3);
    const farOpacities = new Float32Array(farCount);

    for (let i = 0; i < farCount; i++) {
      farPositions[i * 3] = (Math.random() - 0.5) * 500;
      farPositions[i * 3 + 1] = (Math.random() - 0.5) * 350;
      farPositions[i * 3 + 2] = -450 + Math.random() * 450;
      farOpacities[i] = 0.2 + Math.random() * 0.6;
    }
    farGeo.setAttribute("position", new THREE.BufferAttribute(farPositions, 3));

    const farMat = new THREE.PointsMaterial({
      color: 0x14b8a6,
      size: isMobile ? 1.5 : 2.0,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
    });
    const farPoints = new THREE.Points(farGeo, farMat);
    scene.add(farPoints);

    // Distant Grand Geometric Rings (Macro Gates across the depth axis)
    const gateGroup = new THREE.Group();
    const ringGateGeo = new THREE.TorusGeometry(32, 0.4, 8, 48);
    const ringGateMat = new THREE.MeshBasicMaterial({
      color: 0x0d4a3b,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });

    const gateZPositions = [-40, -130, -220, -310, -400];
    const gateMeshes: THREE.Mesh[] = [];
    gateZPositions.forEach((z, idx) => {
      const ring = new THREE.Mesh(ringGateGeo, ringGateMat);
      ring.position.set(0, 0, z);
      ring.scale.setScalar(1 + idx * 0.15);
      gateGroup.add(ring);
      gateMeshes.push(ring);
    });
    scene.add(gateGroup);

    // Deep Grid Matrix Plane at Floor
    const gridPlane = new THREE.GridHelper(600, 40, 0x12634e, 0x092b22);
    gridPlane.position.set(0, -55, -200);
    gridPlane.material.transparent = true;
    gridPlane.material.opacity = 0.25;
    scene.add(gridPlane);

    // =========================================================================
    // LAYER B — MID DISTANCE: Multi-Sector Living Intelligence Architecture
    // =========================================================================

    // --- SECTOR 0 (z ~ 0): Awakening Intelligence Nexus ---
    const nexusGroup = new THREE.Group();
    nexusGroup.position.set(0, 0, 0);

    const nexusCoreGeo = new THREE.IcosahedronGeometry(4.5, 2);
    const nexusCoreMat = new THREE.MeshStandardMaterial({
      color: 0x064e3b,
      wireframe: true,
      emissive: 0x0d4a3b,
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.75,
    });
    const nexusCore = new THREE.Mesh(nexusCoreGeo, nexusCoreMat);
    nexusGroup.add(nexusCore);

    const nexusOrbitGeo = new THREE.TorusGeometry(8.5, 0.15, 8, 64);
    const nexusOrbitMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
    });
    const nexusOrbit1 = new THREE.Mesh(nexusOrbitGeo, nexusOrbitMat);
    nexusOrbit1.rotation.x = Math.PI / 3;
    nexusGroup.add(nexusOrbit1);

    const nexusOrbit2 = new THREE.Mesh(nexusOrbitGeo, nexusOrbitMat);
    nexusOrbit2.rotation.y = Math.PI / 4;
    nexusOrbit2.scale.setScalar(1.2);
    nexusGroup.add(nexusOrbit2);

    scene.add(nexusGroup);

    // --- SECTOR 1 (z ~ -90): Academic Trajectory Regression Spline ---
    const trajectoryGroup = new THREE.Group();
    trajectoryGroup.position.set(0, 0, -90);

    const splinePoints = [
      new THREE.Vector3(-25, -10, 30),
      new THREE.Vector3(-10, 8, 15),
      new THREE.Vector3(12, -4, 0),
      new THREE.Vector3(-6, 12, -15),
      new THREE.Vector3(20, 2, -30),
    ];
    const curve = new THREE.CatmullRomCurve3(splinePoints);
    const splineGeo = new THREE.TubeGeometry(curve, 70, 0.45, 8, false);
    const splineMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x064e3b,
      emissiveIntensity: 0.8,
      wireframe: true,
      transparent: true,
      opacity: 0.65,
    });
    const splineMesh = new THREE.Mesh(splineGeo, splineMat);
    trajectoryGroup.add(splineMesh);

    // Floating Academic Regression Nodes
    const nodeGeo = new THREE.SphereGeometry(1.2, 12, 12);
    const nodeMat = new THREE.MeshStandardMaterial({
      color: 0x34d399,
      emissive: 0x10b981,
      emissiveIntensity: 1.2,
      roughness: 0.2,
    });
    splinePoints.forEach((pt) => {
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      nodeMesh.position.copy(pt);
      trajectoryGroup.add(nodeMesh);
    });
    scene.add(trajectoryGroup);

    // --- SECTOR 2 (z ~ -180): Diagnostic & Risk Matrix (Concentric Rings) ---
    const matrixGroup = new THREE.Group();
    matrixGroup.position.set(0, 0, -180);

    const matrixRingGeo1 = new THREE.RingGeometry(8, 9, 32);
    const matrixRingMat1 = new THREE.MeshBasicMaterial({
      color: 0x14b8a6,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
    });
    const matrixRing1 = new THREE.Mesh(matrixRingGeo1, matrixRingMat1);
    matrixGroup.add(matrixRing1);

    const matrixRingGeo2 = new THREE.RingGeometry(14, 15, 32);
    const matrixRingMat2 = new THREE.MeshBasicMaterial({
      color: 0xc07817, // Amber risk indicator ring
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
    });
    const matrixRing2 = new THREE.Mesh(matrixRingGeo2, matrixRingMat2);
    matrixRing2.rotation.x = Math.PI / 4;
    matrixGroup.add(matrixRing2);

    const matrixOctaGeo = new THREE.OctahedronGeometry(5, 1);
    const matrixOctaMat = new THREE.MeshStandardMaterial({
      color: 0x064e3b,
      wireframe: true,
      emissive: 0x14b8a6,
      emissiveIntensity: 0.5,
    });
    const matrixOcta = new THREE.Mesh(matrixOctaGeo, matrixOctaMat);
    matrixGroup.add(matrixOcta);
    scene.add(matrixGroup);

    // --- SECTOR 3 (z ~ -270): 6D Career Capability Polyhedron ---
    const careerGroup = new THREE.Group();
    careerGroup.position.set(0, 0, -270);

    const polyGeo = new THREE.IcosahedronGeometry(11, 1);
    const polyMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      wireframe: true,
      emissive: 0x064e3b,
      emissiveIntensity: 0.7,
      transparent: true,
      opacity: 0.6,
    });
    const polyMesh = new THREE.Mesh(polyGeo, polyMat);
    careerGroup.add(polyMesh);

    // 6 Primary Capability Dimension Satellites (Academics, Coding, Aptitude, Comm, Portfolio, Skills)
    const satGeo = new THREE.SphereGeometry(1.4, 16, 16);
    const satMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 1.4,
    });
    const satMeshes: THREE.Mesh[] = [];
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const radius = 16;
      const sat = new THREE.Mesh(satGeo, satMat);
      sat.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, (i % 2 === 0 ? 4 : -4));
      careerGroup.add(sat);
      satMeshes.push(sat);
    }
    scene.add(careerGroup);

    // --- SECTOR 4 (z ~ -360): Horizon Gate / Future Trajectory Portal ---
    const horizonGroup = new THREE.Group();
    horizonGroup.position.set(0, 0, -360);

    const horizonTorusGeo = new THREE.TorusGeometry(26, 0.8, 12, 64);
    const horizonTorusMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x059669,
      emissiveIntensity: 1.2,
      wireframe: true,
      transparent: true,
      opacity: 0.7,
    });
    const horizonGate = new THREE.Mesh(horizonTorusGeo, horizonTorusMat);
    horizonGroup.add(horizonGate);

    const horizonCoreGeo = new THREE.TorusGeometry(16, 0.4, 8, 48);
    const horizonCoreMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    const horizonCore = new THREE.Mesh(horizonCoreGeo, horizonCoreMat);
    horizonCore.rotation.x = Math.PI / 2;
    horizonGroup.add(horizonCore);
    scene.add(horizonGroup);

    // =========================================================================
    // LAYER C — NEAR FIELD: Floating Kinetic Data Sparks & Warp Streaks
    // =========================================================================
    const nearCount = Math.floor(180 * particleMultiplier);
    const nearGeo = new THREE.BufferGeometry();
    const nearPositions = new Float32Array(nearCount * 3);
    const nearVelocities = new Float32Array(nearCount);

    for (let i = 0; i < nearCount; i++) {
      nearPositions[i * 3] = (Math.random() - 0.5) * 120;
      nearPositions[i * 3 + 1] = (Math.random() - 0.5) * 90;
      nearPositions[i * 3 + 2] = 50 - Math.random() * 450;
      nearVelocities[i] = 0.2 + Math.random() * 0.5;
    }
    nearGeo.setAttribute("position", new THREE.BufferAttribute(nearPositions, 3));

    const nearMat = new THREE.PointsMaterial({
      color: 0x6ee7b7,
      size: isMobile ? 2.0 : 3.0,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const nearPoints = new THREE.Points(nearGeo, nearMat);
    scene.add(nearPoints);

    // Velocity Streaks (Lines parallel to Z-axis that extend during high scroll velocity)
    const streakCount = Math.floor(45 * particleMultiplier);
    const streakGeo = new THREE.BufferGeometry();
    const streakPositions = new Float32Array(streakCount * 6); // 2 vertices per line
    for (let i = 0; i < streakCount; i++) {
      const sx = (Math.random() - 0.5) * 100;
      const sy = (Math.random() - 0.5) * 70;
      const sz = 40 - Math.random() * 400;
      streakPositions[i * 6] = sx;
      streakPositions[i * 6 + 1] = sy;
      streakPositions[i * 6 + 2] = sz;
      streakPositions[i * 6 + 3] = sx;
      streakPositions[i * 6 + 4] = sy;
      streakPositions[i * 6 + 5] = sz - 4;
    }
    streakGeo.setAttribute("position", new THREE.BufferAttribute(streakPositions, 3));

    const streakMat = new THREE.LineBasicMaterial({
      color: 0x34d399,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
    });
    const streakLines = new THREE.LineSegments(streakGeo, streakMat);
    scene.add(streakLines);

    // Solo Leveling / MHA Heroic Energy Pulse Ring
    const pulseRingGeo = new THREE.RingGeometry(2, 3.5, 48);
    const pulseRingMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
    });
    const pulseRing = new THREE.Mesh(pulseRingGeo, pulseRingMat);
    pulseRing.position.set(0, 0, 10);
    scene.add(pulseRing);

    // =========================================================================
    // SCROLL, MOUSE & EVENT CONTROLLERS
    // =========================================================================
    let scrollProgress = 0;
    let targetScrollProgress = 0;
    let scrollVelocity = 0;
    let lastScrollY = window.scrollY;
    let lastScrollTime = performance.now();

    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    let activePulseScale = 1.0;
    let activePulseOpacity = 0.0;
    let pulseTargetColor = new THREE.Color(0x10b981);

    const onScroll = () => {
      const now = performance.now();
      const dt = Math.max(1, now - lastScrollTime);
      const currentScrollY = window.scrollY;
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);

      targetScrollProgress = Math.min(1.0, Math.max(0.0, currentScrollY / maxScroll));

      // Calculate instantaneous scroll velocity
      const dY = Math.abs(currentScrollY - lastScrollY);
      scrollVelocity = (dY / dt) * 16.6; // normalized velocity per frame

      lastScrollY = currentScrollY;
      lastScrollTime = now;
    };

    const onMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
      targetMouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    const onResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    // Custom Spatial Event Listener
    const onSpatialEvent = (e: Event) => {
      const customEvent = e as CustomEvent<SpatialEventDetail>;
      const detail = customEvent.detail;
      if (!detail) return;

      if (detail.type === "energy-pulse" || detail.type === "speed-burst") {
        activePulseScale = 1.0;
        activePulseOpacity = detail.intensity ? Math.min(1.0, detail.intensity) : 0.85;
        if (detail.color) {
          pulseRingMat.color.setStyle(detail.color);
        }
        pointLight.intensity = 4.0;
      } else if (detail.type === "risk-shift") {
        if (detail.color) {
          matrixRingMat2.color.setStyle(detail.color);
        }
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("gradient-spatial-event", onSpatialEvent);

    // Initial scroll sync
    onScroll();

    // =========================================================================
    // RENDER LOOP WITH CINEMATIC DAMPING & PERFORMANCE OPTIMIZATIONS
    // =========================================================================
    let animationFrameId: number;
    let isVisible = true;
    let clock = new THREE.Clock();

    const onVisibilityChange = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    const render = () => {
      animationFrameId = requestAnimationFrame(render);
      if (!isVisible) return;

      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Damped Lerp Interpolations
      const damping = reducedMotion ? 1.0 : 0.055;
      scrollProgress += (targetScrollProgress - scrollProgress) * damping;
      scrollVelocity *= 0.92; // decay velocity

      mouseX += (targetMouseX - mouseX) * 0.04;
      mouseY += (targetMouseY - mouseY) * 0.04;

      // Camera Travel along Deep Z-Axis Corridor (z: 40 -> -370)
      if (!reducedMotion) {
        const totalTravel = 410; // total z-distance traveled
        const targetZ = 40 - scrollProgress * totalTravel;
        const targetY = Math.sin(scrollProgress * Math.PI * 2.5) * 8 + mouseY * 4;
        const targetX = Math.cos(scrollProgress * Math.PI * 2.0) * 10 + mouseX * 6;

        camera.position.z = targetZ;
        camera.position.y = targetY;
        camera.position.x = targetX;

        // Cinematic Banking & Rotation
        camera.rotation.y = -mouseX * 0.1;
        camera.rotation.x = mouseY * 0.08;
        camera.rotation.z = mouseX * 0.04 + scrollVelocity * 0.003;
      } else {
        camera.position.set(0, 0, 40 - scrollProgress * 410);
      }

      // Move pointLight to follow camera
      pointLight.position.set(camera.position.x, camera.position.y, camera.position.z - 15);
      if (pointLight.intensity > 2.0) {
        pointLight.intensity -= delta * 3.0;
      }

      // 1. Far Constellation slow drift
      if (!reducedMotion) {
        farPoints.rotation.z = elapsed * 0.015;
        gateGroup.rotation.z = elapsed * 0.02;
      }

      // 2. Sector 0 Nexus Core rotation
      if (!reducedMotion) {
        nexusCore.rotation.x = elapsed * 0.2;
        nexusCore.rotation.y = elapsed * 0.3;
        nexusOrbit1.rotation.z = elapsed * 0.4;
        nexusOrbit2.rotation.z = -elapsed * 0.35;
      }

      // 3. Sector 1 Trajectory Spline wave
      if (!reducedMotion) {
        splineMesh.rotation.z = Math.sin(elapsed * 0.5) * 0.08;
      }

      // 4. Sector 2 Matrix Ring counter-rotations
      if (!reducedMotion) {
        matrixRing1.rotation.z = elapsed * 0.3;
        matrixRing2.rotation.z = -elapsed * 0.25;
        matrixOcta.rotation.y = elapsed * 0.4;
      }

      // 5. Sector 3 Career Capability Polyhedron & Satellites
      if (!reducedMotion) {
        polyMesh.rotation.x = elapsed * 0.15;
        polyMesh.rotation.y = elapsed * 0.25;
        satMeshes.forEach((sat, idx) => {
          sat.position.y += Math.sin(elapsed * 2 + idx) * 0.03;
        });
      }

      // 6. Sector 4 Horizon Gate
      if (!reducedMotion) {
        horizonGate.rotation.z = elapsed * 0.18;
        horizonCore.rotation.z = -elapsed * 0.3;
      }

      // 7. Near-field Particles Drift & Scroll Velocity Streaks
      if (!reducedMotion) {
        const positions = nearGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < nearCount; i++) {
          // Particles drift slowly towards camera and wrap around
          positions[i * 3 + 2] += (nearVelocities[i] + scrollVelocity * 0.4);
          if (positions[i * 3 + 2] > camera.position.z + 10) {
            positions[i * 3 + 2] = camera.position.z - 400;
          }
        }
        nearGeo.attributes.position.needsUpdate = true;

        // Velocity Streaks Opacity & Scale
        const streakOpacity = Math.min(0.65, scrollVelocity * 0.08);
        streakMat.opacity = streakOpacity;
        if (streakOpacity > 0.02) {
          streakLines.position.z = camera.position.z - 20;
        }
      }

      // 8. Solo Leveling / MHA Heroic Energy Pulse Animation
      if (activePulseOpacity > 0.01) {
        activePulseScale += delta * 18.0;
        activePulseOpacity -= delta * 1.8;
        pulseRing.position.set(camera.position.x, camera.position.y, camera.position.z - 10);
        pulseRing.scale.setScalar(activePulseScale);
        pulseRingMat.opacity = Math.max(0, activePulseOpacity);
      } else {
        pulseRingMat.opacity = 0;
      }

      renderer.render(scene, camera);
    };

    render();

    // =========================================================================
    // CLEANUP DISPOSAL
    // =========================================================================
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("gradient-spatial-event", onSpatialEvent);
      document.removeEventListener("visibilitychange", onVisibilityChange);

      // Dispose geometries and materials
      farGeo.dispose();
      farMat.dispose();
      ringGateGeo.dispose();
      ringGateMat.dispose();
      gridPlane.geometry.dispose();
      (gridPlane.material as THREE.Material).dispose();

      nexusCoreGeo.dispose();
      nexusCoreMat.dispose();
      nexusOrbitGeo.dispose();
      nexusOrbitMat.dispose();

      splineGeo.dispose();
      splineMat.dispose();
      nodeGeo.dispose();
      nodeMat.dispose();

      matrixRingGeo1.dispose();
      matrixRingMat1.dispose();
      matrixRingGeo2.dispose();
      matrixRingMat2.dispose();
      matrixOctaGeo.dispose();
      matrixOctaMat.dispose();

      polyGeo.dispose();
      polyMat.dispose();
      satGeo.dispose();
      satMat.dispose();

      horizonTorusGeo.dispose();
      horizonTorusMat.dispose();
      horizonCoreGeo.dispose();
      horizonCoreMat.dispose();

      nearGeo.dispose();
      nearMat.dispose();
      streakGeo.dispose();
      streakMat.dispose();
      pulseRingGeo.dispose();
      pulseRingMat.dispose();

      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isClient, reducedMotion]);

  return (
    <div
      ref={containerRef}
      className={`spatial-world-canvas ${className}`}
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 0,
        overflow: "hidden",
      }}
    />
  );
}
