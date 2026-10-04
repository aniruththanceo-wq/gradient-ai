/**
 * Gradient AI — Ultra-Realistic Cinematic Volcano World (Placement)
 * Features:
 * - Fractured basalt column geology with glowing magma veins
 * - Curved spline-based flowing lava channels with pulsating emissive heat
 * - Swirling flying embers with thermal buoyancy & turbulence
 * - Ancient Fantasy Dragon with sinuous curved body, articulated neck & head, breathing wings
 * - Fire Breath Climax: Expanding conical flame torrent rushing toward camera, lighting up the cavern
 */

import * as THREE from "three";
import { disposeWorldGroup } from "./dispose";
import type { WorldUpdateParams } from "./ocean-world";

export class VolcanoWorld {
  public group: THREE.Group;
  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;

  // Environment & Lighting
  private magmaLight: THREE.PointLight;
  private coreLight: THREE.PointLight;
  private lavaMesh: THREE.Mesh;
  private lavaPositions: Float32Array;
  private lavaChannel: THREE.Mesh;
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

    // 1. Physically Influenced Magma Illumination
    this.magmaLight = new THREE.PointLight(0xf97316, 3.8, 130);
    this.magmaLight.position.set(0, -30, 0);
    this.group.add(this.magmaLight);

    this.coreLight = new THREE.PointLight(0xef4444, 4.5, 170);
    this.coreLight.position.set(0, -110, 0);
    this.group.add(this.coreLight);

    // 2. Flowing Magma Surface at Deep Core
    const lavaGeo = new THREE.PlaneGeometry(180, 180, 32, 32);
    lavaGeo.rotateX(-Math.PI / 2);
    this.lavaPositions = lavaGeo.attributes.position.array as Float32Array;
    const lavaMat = new THREE.MeshStandardMaterial({
      color: 0xdc2626,
      emissive: 0xf97316,
      emissiveIntensity: 1.8,
      roughness: 0.2,
      metalness: 0.1,
    });
    this.lavaMesh = new THREE.Mesh(lavaGeo, lavaMat);
    this.lavaMesh.position.set(0, -125, 0);
    this.group.add(this.lavaMesh);

    // 3. Spline-Based Flowing Lava River Channel
    const lavaCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-35, -20, 20),
      new THREE.Vector3(-10, -50, 0),
      new THREE.Vector3(20, -80, -20),
      new THREE.Vector3(0, -120, -30),
    ]);
    const lavaChanGeo = new THREE.TubeGeometry(lavaCurve, 32, 3.2, 8, false);
    const lavaChanMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xf97316,
      emissiveIntensity: 2.2,
      roughness: 0.15,
    });
    this.lavaChannel = new THREE.Mesh(lavaChanGeo, lavaChanMat);
    this.group.add(this.lavaChannel);

    // 4. Fractured Basalt Column Pillars with Vertex Noise
    this.basaltPillars = new THREE.Group();
    const basaltMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.82, flatShading: true });
    const pillarCount = isMobile ? 14 : 36;

    for (let i = 0; i < pillarCount; i++) {
      const h = 35 + Math.random() * 65;
      const pGeo = new THREE.CylinderGeometry(2.6, 3.8, h, 6);
      const pos = pGeo.attributes.position.array as Float32Array;
      for (let p = 0; p < pos.length; p += 3) {
        pos[p] += (Math.random() - 0.5) * 0.8;
      }
      pGeo.computeVertexNormals();
      const pillar = new THREE.Mesh(pGeo, basaltMat);

      const angle = (i / pillarCount) * Math.PI * 2;
      const radius = 24 + Math.random() * 38;
      pillar.position.set(Math.cos(angle) * radius, -38 - (i % 4) * 22, Math.sin(angle) * radius);
      this.basaltPillars.add(pillar);
    }
    this.group.add(this.basaltPillars);

    // 5. Swirling Flying Embers with Thermal Buoyancy
    const emberCount = isMobile ? 180 : 450;
    const emberGeo = new THREE.BufferGeometry();
    this.emberPos = new Float32Array(emberCount * 3);
    this.emberVel = new Float32Array(emberCount);

    for (let i = 0; i < emberCount; i++) {
      this.emberPos[i * 3] = (Math.random() - 0.5) * 85;
      this.emberPos[i * 3 + 1] = -125 + Math.random() * 145;
      this.emberPos[i * 3 + 2] = (Math.random() - 0.5) * 85;
      this.emberVel[i] = 3.2 + Math.random() * 6.5;
    }
    emberGeo.setAttribute("position", new THREE.BufferAttribute(this.emberPos, 3));
    this.emberParticles = new THREE.Points(
      emberGeo,
      new THREE.PointsMaterial({
        color: 0xfbbf24,
        size: 3.0,
        transparent: true,
        opacity: 0.88,
        blending: THREE.AdditiveBlending,
      })
    );
    this.group.add(this.emberParticles);

    // 6. Ancient Fantasy Dragon (in Magma Chamber)
    this.dragonGroup = new THREE.Group();
    this.dragonGroup.position.set(0, -112, -26);

    const dragonMat = new THREE.MeshStandardMaterial({
      color: 0x1e1b4b,
      emissive: 0x431407,
      emissiveIntensity: 0.45,
      roughness: 0.48,
      flatShading: true,
    });

    // Sinuous Body
    this.dragonBody = new THREE.Mesh(new THREE.CapsuleGeometry(2.6, 8.5, 8, 12), dragonMat);
    this.dragonBody.rotation.x = Math.PI / 3;
    this.dragonGroup.add(this.dragonBody);

    // Articulated Head & Horns
    this.dragonHead = new THREE.Group();
    const headMesh = new THREE.Mesh(new THREE.ConeGeometry(1.7, 4.8, 6), dragonMat);
    headMesh.rotation.x = Math.PI / 2;
    this.dragonHead.add(headMesh);

    // Horns
    const hornMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const hornL = new THREE.Mesh(new THREE.ConeGeometry(0.32, 2.4, 4), hornMat);
    hornL.position.set(1.1, 1.3, -1.1);
    hornL.rotation.z = Math.PI / 5;
    const hornR = new THREE.Mesh(new THREE.ConeGeometry(0.32, 2.4, 4), hornMat);
    hornR.position.set(-1.1, 1.3, -1.1);
    hornR.rotation.z = -Math.PI / 5;
    this.dragonHead.add(hornL);
    this.dragonHead.add(hornR);

    // Glowing Cyan Eyes
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee });
    const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.38, 6, 6), eyeMat);
    eyeL.position.set(0.85, 0.65, 1.1);
    const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.38, 6, 6), eyeMat);
    eyeR.position.set(-0.85, 0.65, 1.1);
    this.dragonEyes = new THREE.Mesh();
    this.dragonEyes.add(eyeL);
    this.dragonEyes.add(eyeR);
    this.dragonHead.add(this.dragonEyes);

    this.dragonHead.position.set(0, 4.6, 4.2);
    this.dragonGroup.add(this.dragonHead);

    // Wings
    const wingGeo = new THREE.BoxGeometry(11.0, 0.2, 5.5);
    const wingMat = new THREE.MeshStandardMaterial({
      color: 0x31100b,
      emissive: 0x7f1d1d,
      emissiveIntensity: 0.35,
      side: THREE.DoubleSide,
    });
    this.dragonWingL = new THREE.Mesh(wingGeo, wingMat);
    this.dragonWingL.position.set(6.5, 2.2, 0);
    this.dragonGroup.add(this.dragonWingL);

    this.dragonWingR = new THREE.Mesh(wingGeo, wingMat);
    this.dragonWingR.position.set(-6.5, 2.2, 0);
    this.dragonGroup.add(this.dragonWingR);

    // Conical Fire Stream Particles
    const fireCount = isMobile ? 120 : 280;
    const fireGeo = new THREE.BufferGeometry();
    this.firePositions = new Float32Array(fireCount * 3);
    for (let i = 0; i < fireCount; i++) {
      this.firePositions[i * 3] = (Math.random() - 0.5) * 4;
      this.firePositions[i * 3 + 1] = (Math.random() - 0.5) * 4;
      this.firePositions[i * 3 + 2] = Math.random() * 28;
    }
    fireGeo.setAttribute("position", new THREE.BufferAttribute(this.firePositions, 3));
    this.fireStream = new THREE.Points(
      fireGeo,
      new THREE.PointsMaterial({
        color: 0xf97316,
        size: 5.0,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
      })
    );
    this.fireStream.position.set(0, 4.6, 6.5);
    this.dragonGroup.add(this.fireStream);

    this.dragonGroup.scale.setScalar(1.25);
    this.group.add(this.dragonGroup);
  }

  public update(params: WorldUpdateParams): void {
    const { scrollProgress, scrollVelocity, mouseX, mouseY, delta, elapsed, reducedMotion } = params;

    // 1. Camera Descent into Volcano (Crater y: +15 -> Core y: -115)
    const targetY = 15 - scrollProgress * 130;
    const targetZ = 38 - Math.sin(scrollProgress * Math.PI) * 10;
    const targetX = Math.sin(scrollProgress * Math.PI * 1.8) * 8 + mouseX * 4;

    if (!reducedMotion) {
      this.camera.position.y += (targetY - this.camera.position.y) * 0.06;
      this.camera.position.z += (targetZ - this.camera.position.z) * 0.06;
      this.camera.position.x += (targetX - this.camera.position.x) * 0.06;
      this.camera.rotation.y = -mouseX * 0.06;
      this.camera.rotation.x = mouseY * 0.04 - scrollVelocity * 0.002;
    } else {
      this.camera.position.set(0, targetY, targetZ);
    }

    // 2. Animate Lava Waves & Channel
    if (!reducedMotion) {
      for (let i = 0; i < this.lavaPositions.length; i += 3) {
        const u = this.lavaPositions[i];
        const v = this.lavaPositions[i + 2];
        this.lavaPositions[i + 1] = Math.sin(u * 0.16 + elapsed * 2.2) * Math.cos(v * 0.16 + elapsed * 1.9) * 1.4;
      }
      this.lavaMesh.geometry.attributes.position.needsUpdate = true;
    }

    // 3. Animate Swirling Rising Embers
    if (!reducedMotion) {
      for (let i = 0; i < this.emberPos.length / 3; i++) {
        this.emberPos[i * 3 + 1] += this.emberVel[i] * delta * 7.5;
        this.emberPos[i * 3] += Math.sin(elapsed * 3.2 + i) * 0.12;
        if (this.emberPos[i * 3 + 1] > 20) {
          this.emberPos[i * 3 + 1] = -125;
        }
      }
      this.emberParticles.geometry.attributes.position.needsUpdate = true;
    }

    // 4. Dragon Animation (Breathing, Wing sweeps, Head tracking)
    if (!reducedMotion) {
      const flap = Math.sin(elapsed * 2.6);
      this.dragonWingL.rotation.z = flap * 0.36;
      this.dragonWingR.rotation.z = -flap * 0.36;
      this.dragonHead.rotation.x = Math.sin(elapsed * 1.6) * 0.16;
      this.dragonHead.rotation.y = mouseX * 0.35;
    }

    // 5. Final Fire Event (88% - 100% scroll progress)
    if (scrollProgress >= 0.88) {
      const fireProg = (scrollProgress - 0.88) / 0.12; // 0.0 to 1.0

      if (fireProg < 0.65) {
        // Dragon rears up & breathes expanding fire torrent toward camera
        const surge = fireProg / 0.65;
        this.dragonGroup.position.y = -112 + Math.sin(surge * Math.PI) * 4.2;
        this.dragonHead.rotation.x = -0.3 + Math.sin(surge * Math.PI) * 0.55;
        this.fireOpacity = Math.sin(surge * Math.PI) * 0.96;
        (this.fireStream.material as THREE.PointsMaterial).opacity = this.fireOpacity;

        // Expanding flame torrent animation
        for (let i = 0; i < this.firePositions.length / 3; i++) {
          this.firePositions[i * 3 + 2] += delta * 45.0;
          this.firePositions[i * 3] += (Math.random() - 0.5) * delta * 8.0;
          if (this.firePositions[i * 3 + 2] > 38) {
            this.firePositions[i * 3 + 2] = 0;
            this.firePositions[i * 3] = (Math.random() - 0.5) * 4;
          }
        }
        this.fireStream.geometry.attributes.position.needsUpdate = true;
        this.coreLight.intensity = 4.5 + Math.sin(surge * Math.PI) * 5.5;
      } else {
        // Stabilizes back on basalt roost
        this.fireOpacity = Math.max(0, this.fireOpacity - delta * 3.2);
        (this.fireStream.material as THREE.PointsMaterial).opacity = this.fireOpacity;
        this.coreLight.intensity = 4.5;
        this.dragonGroup.position.y = -112;
      }
    } else {
      (this.fireStream.material as THREE.PointsMaterial).opacity = 0;
      this.coreLight.intensity = 4.5;
    }
  }

  public dispose(): void {
    disposeWorldGroup(this.group);
    this.scene.remove(this.group);
  }
}
