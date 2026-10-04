/**
 * Gradient AI — The Solar System Universe (Onboarding, Reports, Cosmic Pages)
 * Features:
 * - Central blazing Sun with solar corona point light illumination
 * - 6 distinct orbiting planets (Mercury, Earth, Mars, Jupiter, Saturn with 3D rings, Neptune) with orbital rings
 * - 3D Asteroid Belt with orbiting rock chunks
 * - Deep space starfield (2,500 stars) + cosmic nebula gas clouds
 * - Scroll fly-through camera progression through the solar system
 */

import * as THREE from "three";
import type { WorldUpdateParams } from "./ocean-world";

export class SolarWorld {
  public group: THREE.Group;
  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;

  // Environment
  private sunMesh: THREE.Mesh;
  private sunLight: THREE.PointLight;
  private planets: { mesh: THREE.Mesh; orbitRadius: number; speed: number; angle: number }[] = [];
  private asteroidBelt: THREE.Points;
  private asteroidPos: Float32Array;
  private starfield: THREE.Points;

  constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera, isMobile: boolean) {
    this.scene = scene;
    this.camera = camera;
    this.group = new THREE.Group();
    this.scene.add(this.group);

    // 1. Central Blazing Sun
    const sunGeo = new THREE.SphereGeometry(6.5, 24, 24);
    const sunMat = new THREE.MeshBasicMaterial({
      color: 0xffedd5,
    });
    this.sunMesh = new THREE.Mesh(sunGeo, sunMat);
    this.sunMesh.position.set(0, 0, -80);
    this.group.add(this.sunMesh);

    // Corona Sun Light
    this.sunLight = new THREE.PointLight(0xffedd5, 4.5, 300);
    this.sunLight.position.set(0, 0, -80);
    this.group.add(this.sunLight);

    // 2. Planets & Orbital Rings
    const planetConfigs = [
      { name: "Mercury", radius: 0.8, color: 0x94a3b8, orbit: 18, speed: 1.2 },
      { name: "Earth", radius: 1.6, color: 0x38bdf8, orbit: 32, speed: 0.8 },
      { name: "Mars", radius: 1.2, color: 0xef4444, orbit: 46, speed: 0.6 },
      { name: "Jupiter", radius: 3.8, color: 0xf59e0b, orbit: 68, speed: 0.4 },
      { name: "Saturn", radius: 3.0, color: 0xfde047, orbit: 95, speed: 0.3, hasRings: true },
      { name: "Neptune", radius: 2.2, color: 0x6366f1, orbit: 120, speed: 0.2 },
    ];

    planetConfigs.forEach((cfg) => {
      const pGroup = new THREE.Group();
      const pGeo = new THREE.SphereGeometry(cfg.radius, 16, 16);
      const pMat = new THREE.MeshStandardMaterial({
        color: cfg.color,
        roughness: 0.5,
        metalness: 0.2,
      });
      const pMesh = new THREE.Mesh(pGeo, pMat);
      pGroup.add(pMesh);

      // Saturn Rings
      if (cfg.hasRings) {
        const ringGeo = new THREE.RingGeometry(cfg.radius * 1.4, cfg.radius * 2.3, 32);
        ringGeo.rotateX(Math.PI / 2.5);
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0xfef08a,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.7,
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        pGroup.add(ring);
      }

      // Orbital Path Ring
      const orbitGeo = new THREE.BufferGeometry();
      const orbitPoints: number[] = [];
      for (let i = 0; i <= 64; i++) {
        const theta = (i / 64) * Math.PI * 2;
        orbitPoints.push(Math.cos(theta) * cfg.orbit, 0, Math.sin(theta) * cfg.orbit - 80);
      }
      orbitGeo.setAttribute("position", new THREE.Float32BufferAttribute(orbitPoints, 3));
      const orbitLine = new THREE.Line(orbitGeo, new THREE.LineBasicMaterial({
        color: 0x334155,
        transparent: true,
        opacity: 0.4,
      }));
      this.group.add(orbitLine);

      this.group.add(pGroup);
      this.planets.push({
        mesh: pGroup as unknown as THREE.Mesh,
        orbitRadius: cfg.orbit,
        speed: cfg.speed,
        angle: Math.random() * Math.PI * 2,
      });
    });

    // 3. 3D Asteroid Belt
    const astCount = isMobile ? 200 : 600;
    const astGeo = new THREE.BufferGeometry();
    this.asteroidPos = new Float32Array(astCount * 3);
    for (let i = 0; i < astCount; i++) {
      const theta = (i / astCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.2;
      const r = 55 + (Math.random() - 0.5) * 8;
      this.asteroidPos[i * 3] = Math.cos(theta) * r;
      this.asteroidPos[i * 3 + 1] = (Math.random() - 0.5) * 4;
      this.asteroidPos[i * 3 + 2] = Math.sin(theta) * r - 80;
    }
    astGeo.setAttribute("position", new THREE.BufferAttribute(this.asteroidPos, 3));
    this.asteroidBelt = new THREE.Points(astGeo, new THREE.PointsMaterial({
      color: 0x94a3b8,
      size: 1.8,
      transparent: true,
      opacity: 0.75,
    }));
    this.group.add(this.asteroidBelt);

    // 4. Starfield (2,500 deep cosmic stars)
    const starCount = isMobile ? 800 : 2500;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPos[i * 3] = (Math.random() - 0.5) * 350;
      starPos[i * 3 + 1] = (Math.random() - 0.5) * 300;
      starPos[i * 3 + 2] = -50 - Math.random() * 300;
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    this.starfield = new THREE.Points(starGeo, new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1.5,
      transparent: true,
      opacity: 0.85,
    }));
    this.group.add(this.starfield);
  }

  public update(params: WorldUpdateParams): void {
    const { scrollProgress, scrollVelocity, mouseX, mouseY, delta, elapsed, reducedMotion } = params;

    // 1. Space Camera Fly-Through (z: +50 flying through to -140 near outer planets)
    const targetZ = 50 - scrollProgress * 160;
    const targetY = 15 - scrollProgress * 40;
    const targetX = Math.sin(scrollProgress * Math.PI) * 20 + mouseX * 8;

    if (!reducedMotion) {
      this.camera.position.z += (targetZ - this.camera.position.z) * 0.06;
      this.camera.position.y += (targetY - this.camera.position.y) * 0.06;
      this.camera.position.x += (targetX - this.camera.position.x) * 0.06;
      this.camera.rotation.y = -mouseX * 0.08;
      this.camera.rotation.x = (mouseY * 0.05) - (scrollVelocity * 0.002);
    } else {
      this.camera.position.set(0, targetY, targetZ);
    }

    // 2. Animate Planetary Orbits
    if (!reducedMotion) {
      this.planets.forEach((p) => {
        p.angle += delta * p.speed * 0.3;
        p.mesh.position.set(
          Math.cos(p.angle) * p.orbitRadius,
          Math.sin(p.angle * 2) * 2.0,
          Math.sin(p.angle) * p.orbitRadius - 80
        );
        p.mesh.rotation.y += delta * 0.8;
      });
      this.asteroidBelt.rotation.y += delta * 0.05;
      this.sunMesh.rotation.y += delta * 0.1;
    }
  }

  public dispose(): void {
    this.scene.remove(this.group);
    this.sunMesh.geometry.dispose();
    (this.sunMesh.material as THREE.Material).dispose();
    this.asteroidBelt.geometry.dispose();
    (this.asteroidBelt.material as THREE.Material).dispose();
    this.starfield.geometry.dispose();
    (this.starfield.material as THREE.Material).dispose();
  }
}
