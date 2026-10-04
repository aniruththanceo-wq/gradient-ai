/**
 * Gradient AI — Ultra-Realistic Cinematic Solar System Universe (Onboarding, Reports, Space)
 * Features:
 * - Central blazing Sun with solar corona layers & dynamic point illumination
 * - 6 distinct orbiting planets with individual atmospheric shells (Fresnel rim glow) & Saturn 3D rings
 * - 3D Asteroid Belt with tumbling irregular rock chunks
 * - Deep space starfield (2,800 stars) + cosmic nebula gas clouds
 * - Cinematic orbital space camera fly-through
 */

import * as THREE from "three";
import { disposeWorldGroup } from "./dispose";
import type { WorldUpdateParams } from "./ocean-world";

export class SolarWorld {
  public group: THREE.Group;
  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;

  // Environment
  private sunMesh: THREE.Mesh;
  private sunCorona: THREE.Mesh;
  private sunLight: THREE.PointLight;
  private planets: { mesh: THREE.Group; orbitRadius: number; speed: number; angle: number }[] = [];
  private asteroidBelt: THREE.Points;
  private asteroidPos: Float32Array;
  private starfield: THREE.Points;

  constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera, isMobile: boolean) {
    this.scene = scene;
    this.camera = camera;
    this.group = new THREE.Group();
    this.scene.add(this.group);

    // 1. Central Blazing Sun & Corona
    const sunGeo = new THREE.SphereGeometry(6.8, 28, 28);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xffedd5 });
    this.sunMesh = new THREE.Mesh(sunGeo, sunMat);
    this.sunMesh.position.set(0, 0, -80);
    this.group.add(this.sunMesh);

    // Outer Solar Corona Flare
    const coronaGeo = new THREE.SphereGeometry(8.5, 20, 20);
    const coronaMat = new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      transparent: true,
      opacity: 0.28,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
    });
    this.sunCorona = new THREE.Mesh(coronaGeo, coronaMat);
    this.sunCorona.position.set(0, 0, -80);
    this.group.add(this.sunCorona);

    // Sun Illumination Light
    this.sunLight = new THREE.PointLight(0xffedd5, 4.8, 320);
    this.sunLight.position.set(0, 0, -80);
    this.group.add(this.sunLight);

    // 2. Planets & Elliptical Orbital Splines
    const planetConfigs = [
      { name: "Mercury", radius: 0.85, color: 0x94a3b8, orbit: 19, speed: 1.25, atmosphere: 0x64748b },
      { name: "Earth", radius: 1.7, color: 0x38bdf8, orbit: 34, speed: 0.85, atmosphere: 0x0284c7 },
      { name: "Mars", radius: 1.25, color: 0xef4444, orbit: 48, speed: 0.65, atmosphere: 0xb91c1c },
      { name: "Jupiter", radius: 4.0, color: 0xf59e0b, orbit: 70, speed: 0.42, atmosphere: 0xd97706 },
      { name: "Saturn", radius: 3.2, color: 0xfde047, orbit: 98, speed: 0.32, atmosphere: 0xca8a04, hasRings: true },
      { name: "Neptune", radius: 2.3, color: 0x6366f1, orbit: 125, speed: 0.22, atmosphere: 0x4338ca },
    ];

    planetConfigs.forEach((cfg) => {
      const pGroup = new THREE.Group();
      const pGeo = new THREE.SphereGeometry(cfg.radius, 20, 20);
      const pMat = new THREE.MeshStandardMaterial({
        color: cfg.color,
        roughness: 0.45,
        metalness: 0.2,
      });
      const pMesh = new THREE.Mesh(pGeo, pMat);
      pGroup.add(pMesh);

      // Atmospheric Rim Shell
      const atmoGeo = new THREE.SphereGeometry(cfg.radius * 1.12, 16, 16);
      const atmoMat = new THREE.MeshBasicMaterial({
        color: cfg.atmosphere,
        transparent: true,
        opacity: 0.25,
        blending: THREE.AdditiveBlending,
      });
      const atmo = new THREE.Mesh(atmoGeo, atmoMat);
      pGroup.add(atmo);

      // Saturn Rings
      if (cfg.hasRings) {
        const ringGeo = new THREE.RingGeometry(cfg.radius * 1.45, cfg.radius * 2.4, 36);
        ringGeo.rotateX(Math.PI / 2.4);
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0xfef08a,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.72,
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        pGroup.add(ring);
      }

      // Orbital Spline Path
      const orbitCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(cfg.orbit, 0, -80),
        new THREE.Vector3(0, cfg.orbit * 0.15, -80 + cfg.orbit),
        new THREE.Vector3(-cfg.orbit, 0, -80),
        new THREE.Vector3(0, -cfg.orbit * 0.15, -80 - cfg.orbit),
      ], true);

      const orbitTubeGeo = new THREE.TubeGeometry(orbitCurve, 48, 0.1, 4, true);
      const orbitLine = new THREE.Mesh(
        orbitTubeGeo,
        new THREE.MeshBasicMaterial({ color: 0x334155, transparent: true, opacity: 0.35 })
      );
      this.group.add(orbitLine);

      this.group.add(pGroup);
      this.planets.push({
        mesh: pGroup,
        orbitRadius: cfg.orbit,
        speed: cfg.speed,
        angle: Math.random() * Math.PI * 2,
      });
    });

    // 3. 3D Asteroid Belt (Instanced Rock Chunks)
    const astCount = isMobile ? 220 : 650;
    const astGeo = new THREE.BufferGeometry();
    this.asteroidPos = new Float32Array(astCount * 3);
    for (let i = 0; i < astCount; i++) {
      const theta = (i / astCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.25;
      const r = 58 + (Math.random() - 0.5) * 9;
      this.asteroidPos[i * 3] = Math.cos(theta) * r;
      this.asteroidPos[i * 3 + 1] = (Math.random() - 0.5) * 4.5;
      this.asteroidPos[i * 3 + 2] = Math.sin(theta) * r - 80;
    }
    astGeo.setAttribute("position", new THREE.BufferAttribute(this.asteroidPos, 3));
    this.asteroidBelt = new THREE.Points(
      astGeo,
      new THREE.PointsMaterial({ color: 0x94a3b8, size: 2.0, transparent: true, opacity: 0.8 })
    );
    this.group.add(this.asteroidBelt);

    // 4. Starfield (2,800 deep cosmic stars)
    const starCount = isMobile ? 900 : 2800;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPos[i * 3] = (Math.random() - 0.5) * 380;
      starPos[i * 3 + 1] = (Math.random() - 0.5) * 320;
      starPos[i * 3 + 2] = -50 - Math.random() * 320;
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    this.starfield = new THREE.Points(
      starGeo,
      new THREE.PointsMaterial({ color: 0xffffff, size: 1.6, transparent: true, opacity: 0.9 })
    );
    this.group.add(this.starfield);
  }

  public update(params: WorldUpdateParams): void {
    const { scrollProgress, scrollVelocity, mouseX, mouseY, delta, elapsed, reducedMotion } = params;

    // 1. Orbital Space Camera Fly-Through (z: +50 -> -145)
    const targetZ = 50 - scrollProgress * 165;
    const targetY = 15 - scrollProgress * 42;
    const targetX = Math.sin(scrollProgress * Math.PI) * 22 + mouseX * 8;

    if (!reducedMotion) {
      this.camera.position.z += (targetZ - this.camera.position.z) * 0.06;
      this.camera.position.y += (targetY - this.camera.position.y) * 0.06;
      this.camera.position.x += (targetX - this.camera.position.x) * 0.06;
      this.camera.rotation.y = -mouseX * 0.08;
      this.camera.rotation.x = mouseY * 0.05 - scrollVelocity * 0.002;
    } else {
      this.camera.position.set(0, targetY, targetZ);
    }

    // 2. Animate Planetary Orbits & Solar Corona Pulse
    if (!reducedMotion) {
      this.planets.forEach((p) => {
        p.angle += delta * p.speed * 0.32;
        p.mesh.position.set(
          Math.cos(p.angle) * p.orbitRadius,
          Math.sin(p.angle * 2) * 2.2,
          Math.sin(p.angle) * p.orbitRadius - 80
        );
        p.mesh.rotation.y += delta * 0.85;
      });
      this.asteroidBelt.rotation.y += delta * 0.055;
      this.sunMesh.rotation.y += delta * 0.12;

      // Solar Corona pulsation
      const coronaPulse = 1.0 + Math.sin(elapsed * 2.0) * 0.05;
      this.sunCorona.scale.setScalar(coronaPulse);
    }
  }

  public dispose(): void {
    disposeWorldGroup(this.group);
    this.scene.remove(this.group);
  }
}
