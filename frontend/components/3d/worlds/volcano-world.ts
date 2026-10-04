/**
 * Gradient AI — The Volcano Descent (Placement World)
 * Features:
 * - Volcanic crater rim with dark obsidian rocks, smoke, and magma glow
 * - Camera descent down vertical basalt canyon walls into glowing lava rivers
 * - Flying ember sparks & rising heat haze particles
 * - Ancient Fantasy Dragon perched in the core chamber with wing & head animation
 * - Final Fire Event: Dragon rears, breathes a torrent of flame & embers toward camera, then stabilizes
 */

import * as THREE from "three";
import { disposeWorldGroup } from "./dispose";
import type { WorldUpdateParams } from "./ocean-world";

export class VolcanoWorld {
  public group: THREE.Group;
  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;

  // Environment
  private magmaLight: THREE.PointLight;
  private coreLight: THREE.PointLight;
  private lavaMesh: THREE.Mesh;
  private lavaPositions: Float32Array;
  private basaltPillars: THREE.Group;
  private emberParticles: THREE.Points;
  private emberPos: Float32Array;
  private emberVel: Float32Array;

  // Ancient Dragon
  private dragonGroup: THREE.Group;
  private dragonBody: THREE.Mesh;
  private dragonHead: THREE.Group;
  private dragonWingL: THREE.Mesh;
  private dragonWingR: THREE.Mesh;
  private dragonEyes: THREE.Mesh;
  private fireStream: THREE.Points;
  private firePositions: Float32Array;
  private fireOpacity = 0.0;

  constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera, isMobile: boolean) {
    this.scene = scene;
    this.camera = camera;
    this.group = new THREE.Group();
    this.scene.add(this.group);
    this.scene.fog = new THREE.FogExp2(0x210b08, 0.014);
    this.group.add(new THREE.HemisphereLight(0x4a170c, 0x050302, 0.65));

    // 1. Lighting (Intense volcanic magma glow)
    this.magmaLight = new THREE.PointLight(0xf97316, 3.5, 120);
    this.magmaLight.position.set(0, -30, 0);
    this.group.add(this.magmaLight);

    this.coreLight = new THREE.PointLight(0xef4444, 4.0, 160);
    this.coreLight.position.set(0, -110, 0);
    this.group.add(this.coreLight);

    // 2. Flowing Lava River Plane at Deep Core
    const lavaGeo = new THREE.PlaneGeometry(160, 160, 24, 24);
    lavaGeo.rotateX(-Math.PI / 2);
    this.lavaPositions = lavaGeo.attributes.position.array as Float32Array;
    const lavaMat = new THREE.MeshPhysicalMaterial({
      color: 0x8f1d0d,
      emissive: 0xf97316,
      emissiveIntensity: 1.25,
      roughness: 0.38,
      metalness: 0.0,
      clearcoat: 0.15,
    });
    this.lavaMesh = new THREE.Mesh(lavaGeo, lavaMat);
    this.lavaMesh.position.set(0, -125, 0);
    this.group.add(this.lavaMesh);

    // 3. Basalt Columns & Crater Canyon Walls
    this.basaltPillars = new THREE.Group();
    const basaltMat = new THREE.MeshStandardMaterial({ color: 0x120f10, roughness: 0.96, metalness: 0.02, flatShading: true });
    const pillarCount = isMobile ? 12 : 32;

    for (let i = 0; i < pillarCount; i++) {
      const h = 30 + Math.random() * 60;
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 3.5, h, 6), basaltMat);
      const angle = (i / pillarCount) * Math.PI * 2;
      const radius = 22 + Math.random() * 35;
      pillar.position.set(Math.cos(angle) * radius, -40 - (i % 4) * 20, Math.sin(angle) * radius);
      this.basaltPillars.add(pillar);
    }
    this.group.add(this.basaltPillars);

    // 4. Flying Ember Sparks & Heat Particles
    const emberCount = isMobile ? 150 : 400;
    const emberGeo = new THREE.BufferGeometry();
    this.emberPos = new Float32Array(emberCount * 3);
    this.emberVel = new Float32Array(emberCount);

    for (let i = 0; i < emberCount; i++) {
      this.emberPos[i * 3] = (Math.random() - 0.5) * 80;
      this.emberPos[i * 3 + 1] = -125 + Math.random() * 140;
      this.emberPos[i * 3 + 2] = (Math.random() - 0.5) * 80;
      this.emberVel[i] = 3.0 + Math.random() * 6.0;
    }
    emberGeo.setAttribute("position", new THREE.BufferAttribute(this.emberPos, 3));
    this.emberParticles = new THREE.Points(emberGeo, new THREE.PointsMaterial({
      color: 0xfbbf24,
      size: 2.8,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    }));
    this.group.add(this.emberParticles);

    // 5. Ancient Fantasy Dragon (in Core Chamber)
    this.dragonGroup = new THREE.Group();
    this.dragonGroup.position.set(0, -112, -25);

    const dragonMat = new THREE.MeshStandardMaterial({
      color: 0x1e1b4b,
      emissive: 0x210803,
      emissiveIntensity: 0.12,
      roughness: 0.78,
      flatShading: true,
    });

    // Body
    this.dragonBody = new THREE.Mesh(new THREE.CapsuleGeometry(2.5, 8.0, 8, 12), dragonMat);
    this.dragonBody.rotation.x = Math.PI / 3;
    this.dragonGroup.add(this.dragonBody);

    // Head & Horns
    this.dragonHead = new THREE.Group();
    const headMesh = new THREE.Mesh(new THREE.ConeGeometry(1.6, 4.5, 6), dragonMat);
    headMesh.rotation.x = Math.PI / 2;
    this.dragonHead.add(headMesh);

    const hornMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const hornL = new THREE.Mesh(new THREE.ConeGeometry(0.3, 2.2, 4), hornMat);
    hornL.position.set(1.0, 1.2, -1.0);
    hornL.rotation.z = Math.PI / 5;
    const hornR = new THREE.Mesh(new THREE.ConeGeometry(0.3, 2.2, 4), hornMat);
    hornR.position.set(-1.0, 1.2, -1.0);
    hornR.rotation.z = -Math.PI / 5;
    this.dragonHead.add(hornL);
    this.dragonHead.add(hornR);

    // Glowing Eyes
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee });
    const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.35, 6, 6), eyeMat);
    eyeL.position.set(0.8, 0.6, 1.0);
    const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.35, 6, 6), eyeMat);
    eyeR.position.set(-0.8, 0.6, 1.0);
    this.dragonEyes = new THREE.Mesh();
    this.dragonEyes.add(eyeL);
    this.dragonEyes.add(eyeR);
    this.dragonHead.add(this.dragonEyes);

    this.dragonHead.position.set(0, 4.5, 4.0);
    this.dragonGroup.add(this.dragonHead);

    // Wings
    const wingGeo = new THREE.BoxGeometry(10.0, 0.2, 5.0);
    const wingMat = new THREE.MeshStandardMaterial({
      color: 0x31100b,
      emissive: 0x441108,
      emissiveIntensity: 0.12,
      roughness: 0.82,
      side: THREE.DoubleSide,
    });
    this.dragonWingL = new THREE.Mesh(wingGeo, wingMat);
    this.dragonWingL.position.set(6.0, 2.0, 0);
    this.dragonGroup.add(this.dragonWingL);

    this.dragonWingR = new THREE.Mesh(wingGeo, wingMat);
    this.dragonWingR.position.set(-6.0, 2.0, 0);
    this.dragonGroup.add(this.dragonWingR);

    // Fire Breath Stream Particles
    const fireCount = isMobile ? 100 : 250;
    const fireGeo = new THREE.BufferGeometry();
    this.firePositions = new Float32Array(fireCount * 3);
    for (let i = 0; i < fireCount; i++) {
      this.firePositions[i * 3] = (Math.random() - 0.5) * 4;
      this.firePositions[i * 3 + 1] = (Math.random() - 0.5) * 4;
      this.firePositions[i * 3 + 2] = Math.random() * 25;
    }
    fireGeo.setAttribute("position", new THREE.BufferAttribute(this.firePositions, 3));
    this.fireStream = new THREE.Points(fireGeo, new THREE.PointsMaterial({
      color: 0xf97316,
      size: 4.5,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    }));
    this.fireStream.position.set(0, 4.5, 6.0);
    this.dragonGroup.add(this.fireStream);

    this.dragonGroup.scale.setScalar(1.2);
    this.group.add(this.dragonGroup);
  }

  public update(params: WorldUpdateParams): void {
    const { scrollProgress, scrollVelocity, mouseX, mouseY, delta, elapsed, reducedMotion } = params;

    // 1. Camera Descent into Volcano (y: +15 at crater down to -115 in core magma chamber)
    const targetY = 15 - scrollProgress * 130;
    const targetZ = 38 - Math.sin(scrollProgress * Math.PI) * 10;
    const targetX = Math.sin(scrollProgress * Math.PI * 1.8) * 8 + mouseX * 4;

    if (!reducedMotion) {
      this.camera.position.y += (targetY - this.camera.position.y) * 0.06;
      this.camera.position.z += (targetZ - this.camera.position.z) * 0.06;
      this.camera.position.x += (targetX - this.camera.position.x) * 0.06;
      this.camera.rotation.y = -mouseX * 0.06;
      this.camera.rotation.x = (mouseY * 0.04) - (scrollVelocity * 0.002);
    } else {
      this.camera.position.set(0, targetY, targetZ);
    }

    // 2. Animate Lava Surface Waves
    if (!reducedMotion) {
      for (let i = 0; i < this.lavaPositions.length; i += 3) {
        const u = this.lavaPositions[i];
        const v = this.lavaPositions[i + 2];
        this.lavaPositions[i + 1] = Math.sin(u * 0.15 + elapsed * 2.0) * Math.cos(v * 0.15 + elapsed * 1.8) * 1.2;
      }
      this.lavaMesh.geometry.attributes.position.needsUpdate = true;
    }

    // 3. Animate Rising Embers
    if (!reducedMotion) {
      for (let i = 0; i < this.emberPos.length / 3; i++) {
        this.emberPos[i * 3 + 1] += this.emberVel[i] * delta * 7.0;
        this.emberPos[i * 3] += Math.sin(elapsed * 3.0 + i) * 0.1;
        if (this.emberPos[i * 3 + 1] > 20) {
          this.emberPos[i * 3 + 1] = -125;
        }
      }
      this.emberParticles.geometry.attributes.position.needsUpdate = true;
    }

    // 4. Dragon Animation (Breathing, Wing flapping, Head movement)
    if (!reducedMotion) {
      const flap = Math.sin(elapsed * 2.5);
      this.dragonWingL.rotation.z = flap * 0.35;
      this.dragonWingR.rotation.z = -flap * 0.35;
      this.dragonHead.rotation.x = Math.sin(elapsed * 1.5) * 0.15;
      this.dragonHead.rotation.y = mouseX * 0.3;
    }

    // 5. Final Fire Event (88% - 100% scroll progress)
    if (scrollProgress >= 0.88) {
      const fireProg = (scrollProgress - 0.88) / 0.12; // 0.0 to 1.0

      if (fireProg < 0.65) {
        // Dragon rears up & breathes fire torrent toward camera
        const surge = fireProg / 0.65;
        this.dragonGroup.position.y = -112 + Math.sin(surge * Math.PI) * 4.0;
        this.dragonHead.rotation.x = -0.3 + Math.sin(surge * Math.PI) * 0.5;
        this.fireOpacity = Math.sin(surge * Math.PI) * 0.95;
        (this.fireStream.material as THREE.PointsMaterial).opacity = this.fireOpacity;

        // Animate fire stream rushing forward
        for (let i = 0; i < this.firePositions.length / 3; i++) {
          this.firePositions[i * 3 + 2] += delta * 40.0;
          if (this.firePositions[i * 3 + 2] > 35) this.firePositions[i * 3 + 2] = 0;
        }
        this.fireStream.geometry.attributes.position.needsUpdate = true;
        this.coreLight.intensity = 4.0 + Math.sin(surge * Math.PI) * 5.0;
      } else {
        // Stabilizes back on roost
        this.fireOpacity = Math.max(0, this.fireOpacity - delta * 3.0);
        (this.fireStream.material as THREE.PointsMaterial).opacity = this.fireOpacity;
        this.coreLight.intensity = 4.0;
        this.dragonGroup.position.y = -112;
      }
    } else {
      (this.fireStream.material as THREE.PointsMaterial).opacity = 0;
      this.coreLight.intensity = 4.0;
    }
  }

  public dispose(): void {
    this.scene.remove(this.group);
    disposeWorldGroup(this.group);
  }
}
