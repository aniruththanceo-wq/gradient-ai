/**
 * Gradient AI — Ultra-Realistic Cinematic Volcano World (Placement Intelligence)
 * Features:
 * - Fractured basalt column geology with glowing magma veins & dynamic cavern lighting
 * - Curved spline-based flowing lava channels with pulsating thermal emissive heat
 * - Swirling buoyant embers and expanding thermal smoke plumes
 * - Ancient Fantasy Dragon with sinuous body, horned head, glowing cyan eyes, articulated wings, dorsal ridge, and tail
 * - Conical Flame Torrent Climax: Multi-layered expanding firestorm lighting up the cavern as it rushes toward camera
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
  private rimLight: THREE.DirectionalLight;
  private lavaMesh: THREE.Mesh;
  private lavaPositions: Float32Array;
  private lavaChannel: THREE.Mesh;
  private basaltPillars: THREE.Group;
  private emberParticles: THREE.Points;
  private emberPos: Float32Array;
  private emberVel: Float32Array;
  private smokeParticles: THREE.Points;
  private smokePos: Float32Array;

  // Ancient Dragon
  private dragonGroup: THREE.Group;
  private dragonBody: THREE.Mesh;
  private dragonHead: THREE.Group;
  private dragonWingL: THREE.Group;
  private dragonWingR: THREE.Group;
  private dragonEyes: THREE.Mesh;
  private dragonTail: THREE.Mesh;
  private fireStream: THREE.Points;
  private firePositions: Float32Array;
  private fireOpacity = 0.0;

  constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera, isMobile: boolean) {
    this.scene = scene;
    this.camera = camera;
    this.group = new THREE.Group();
    this.scene.add(this.group);

    // 1. Physically Influenced Magma Illumination & Crater Rim Light
    this.magmaLight = new THREE.PointLight(0xf97316, 4.2, 140);
    this.magmaLight.position.set(0, -30, 0);
    this.group.add(this.magmaLight);

    this.coreLight = new THREE.PointLight(0xef4444, 5.0, 180);
    this.coreLight.position.set(0, -110, 0);
    this.group.add(this.coreLight);

    // Cool rim light from crater entrance above for creature silhouette separation
    this.rimLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    this.rimLight.position.set(0, 40, 30);
    this.group.add(this.rimLight);

    // 2. Flowing Magma Surface at Deep Core
    const lavaGeo = new THREE.PlaneGeometry(200, 200, 36, 36);
    lavaGeo.rotateX(-Math.PI / 2);
    this.lavaPositions = lavaGeo.attributes.position.array as Float32Array;
    const lavaMat = new THREE.MeshStandardMaterial({
      color: 0xdc2626,
      emissive: 0xf97316,
      emissiveIntensity: 2.0,
      roughness: 0.18,
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
    const lavaChanGeo = new THREE.TubeGeometry(lavaCurve, 36, 3.4, 8, false);
    const lavaChanMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xf97316,
      emissiveIntensity: 2.4,
      roughness: 0.15,
    });
    this.lavaChannel = new THREE.Mesh(lavaChanGeo, lavaChanMat);
    this.group.add(this.lavaChannel);

    // 4. Fractured Hexagonal Basalt Column Pillars
    this.basaltPillars = new THREE.Group();
    const basaltMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.85, flatShading: true });
    const pillarCount = isMobile ? 16 : 40;

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

    // 5. Thermal Flying Embers & Smoke Plumes
    const emberCount = isMobile ? 180 : 450;
    const emberGeo = new THREE.BufferGeometry();
    this.emberPos = new Float32Array(emberCount * 3);
    this.emberVel = new Float32Array(emberCount);

    for (let i = 0; i < emberCount; i++) {
      this.emberPos[i * 3] = (Math.random() - 0.5) * 90;
      this.emberPos[i * 3 + 1] = -125 + Math.random() * 150;
      this.emberPos[i * 3 + 2] = (Math.random() - 0.5) * 90;
      this.emberVel[i] = 3.5 + Math.random() * 7.0;
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

    // Drifting Volcanic Smoke
    const smokeCount = isMobile ? 60 : 150;
    const smokeGeo = new THREE.BufferGeometry();
    this.smokePos = new Float32Array(smokeCount * 3);
    for (let i = 0; i < smokeCount; i++) {
      this.smokePos[i * 3] = (Math.random() - 0.5) * 80;
      this.smokePos[i * 3 + 1] = -110 + Math.random() * 120;
      this.smokePos[i * 3 + 2] = (Math.random() - 0.5) * 80;
    }
    smokeGeo.setAttribute("position", new THREE.BufferAttribute(this.smokePos, 3));
    this.smokeParticles = new THREE.Points(
      smokeGeo,
      new THREE.PointsMaterial({
        color: 0x475569,
        size: 9.0,
        transparent: true,
        opacity: 0.28,
      })
    );
    this.group.add(this.smokeParticles);

    // 6. Ancient Fantasy Dragon (Clearly Visible with Rich Anatomy)
    this.dragonGroup = new THREE.Group();
    this.dragonGroup.position.set(0, -112, -26);

    const dragonMat = new THREE.MeshStandardMaterial({
      color: 0x1e1b4b,
      emissive: 0x431407,
      emissiveIntensity: 0.5,
      roughness: 0.45,
      metalness: 0.2,
      flatShading: true,
    });

    // Sinuous Serpentine Torso & Dorsal Spines
    this.dragonBody = new THREE.Mesh(new THREE.CapsuleGeometry(2.8, 9.2, 8, 12), dragonMat);
    this.dragonBody.rotation.x = Math.PI / 3;
    this.dragonGroup.add(this.dragonBody);

    // Dorsal Spines along back
    const spineMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    for (let s = 0; s < 5; s++) {
      const spine = new THREE.Mesh(new THREE.ConeGeometry(0.35, 1.4, 4), spineMat);
      spine.position.set(0, 1.8 - s * 0.8, -1.8 + s * 1.0);
      spine.rotation.x = -Math.PI / 4;
      this.dragonGroup.add(spine);
    }

    // Articulated Head & Horns
    this.dragonHead = new THREE.Group();
    const headMesh = new THREE.Mesh(new THREE.ConeGeometry(1.8, 5.2, 6), dragonMat);
    headMesh.rotation.x = Math.PI / 2;
    this.dragonHead.add(headMesh);

    const hornMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const hornL = new THREE.Mesh(new THREE.ConeGeometry(0.35, 2.6, 4), hornMat);
    hornL.position.set(1.1, 1.4, -1.1);
    hornL.rotation.z = Math.PI / 5;
    const hornR = new THREE.Mesh(new THREE.ConeGeometry(0.35, 2.6, 4), hornMat);
    hornR.position.set(-1.1, 1.4, -1.1);
    hornR.rotation.z = -Math.PI / 5;
    this.dragonHead.add(hornL);
    this.dragonHead.add(hornR);

    // Glowing Cyan Eyes
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee });
    const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.42, 6, 6), eyeMat);
    eyeL.position.set(0.9, 0.7, 1.2);
    const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.42, 6, 6), eyeMat);
    eyeR.position.set(-0.9, 0.7, 1.2);
    this.dragonEyes = new THREE.Mesh();
    this.dragonEyes.add(eyeL);
    this.dragonEyes.add(eyeR);
    this.dragonHead.add(this.dragonEyes);

    this.dragonHead.position.set(0, 4.8, 4.4);
    this.dragonGroup.add(this.dragonHead);

    // Articulated Wings with Membranes
    const wingMat = new THREE.MeshStandardMaterial({
      color: 0x31100b,
      emissive: 0x7f1d1d,
      emissiveIntensity: 0.4,
      side: THREE.DoubleSide,
    });

    this.dragonWingL = new THREE.Group();
    const wingMeshL = new THREE.Mesh(new THREE.BoxGeometry(12.0, 0.2, 6.0), wingMat);
    wingMeshL.position.set(6.0, 0, 0);
    this.dragonWingL.add(wingMeshL);
    this.dragonWingL.position.set(1.5, 2.4, 0);
    this.dragonGroup.add(this.dragonWingL);

    this.dragonWingR = new THREE.Group();
    const wingMeshR = new THREE.Mesh(new THREE.BoxGeometry(12.0, 0.2, 6.0), wingMat);
    wingMeshR.position.set(-6.0, 0, 0);
    this.dragonWingR.add(wingMeshR);
    this.dragonWingR.position.set(-1.5, 2.4, 0);
    this.dragonGroup.add(this.dragonWingR);

    // Barbed Tail
    const tailGeo = new THREE.CylinderGeometry(0.4, 1.2, 8.0, 6);
    tailGeo.rotateX(-Math.PI / 3);
    this.dragonTail = new THREE.Mesh(tailGeo, dragonMat);
    this.dragonTail.position.set(0, -3.2, -4.5);
    const tailBarb = new THREE.Mesh(new THREE.ConeGeometry(0.8, 2.2, 4), spineMat);
    tailBarb.position.set(0, -4.5, -4.0);
    this.dragonTail.add(tailBarb);
    this.dragonGroup.add(this.dragonTail);

    // Conical Fire Stream Particles
    const fireCount = isMobile ? 140 : 320;
    const fireGeo = new THREE.BufferGeometry();
    this.firePositions = new Float32Array(fireCount * 3);
    for (let i = 0; i < fireCount; i++) {
      this.firePositions[i * 3] = (Math.random() - 0.5) * 4;
      this.firePositions[i * 3 + 1] = (Math.random() - 0.5) * 4;
      this.firePositions[i * 3 + 2] = Math.random() * 32;
    }
    fireGeo.setAttribute("position", new THREE.BufferAttribute(this.firePositions, 3));
    this.fireStream = new THREE.Points(
      fireGeo,
      new THREE.PointsMaterial({
        color: 0xf97316,
        size: 5.2,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
      })
    );
    this.fireStream.position.set(0, 4.8, 7.0);
    this.dragonGroup.add(this.fireStream);

    this.dragonGroup.scale.setScalar(1.25);
    this.group.add(this.dragonGroup);
  }

  public update(params: WorldUpdateParams): void {
    const { scrollProgress, scrollVelocity, mouseX, mouseY, delta, elapsed, reducedMotion } = params;

    // 1. Camera Descent into Volcano
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

    // 3. Buoyant Embers & Smoke Motion
    if (!reducedMotion) {
      for (let i = 0; i < this.emberPos.length / 3; i++) {
        this.emberPos[i * 3 + 1] += this.emberVel[i] * delta;
        this.emberPos[i * 3] += Math.sin(elapsed * 2.5 + i) * 0.08;
        if (this.emberPos[i * 3 + 1] > 20) {
          this.emberPos[i * 3 + 1] = -125;
        }
      }
      this.emberParticles.geometry.attributes.position.needsUpdate = true;

      for (let i = 0; i < this.smokePos.length / 3; i++) {
        this.smokePos[i * 3 + 1] += delta * 6;
        this.smokePos[i * 3] += Math.cos(elapsed * 0.8 + i) * 0.05;
        if (this.smokePos[i * 3 + 1] > 20) {
          this.smokePos[i * 3 + 1] = -110;
        }
      }
      this.smokeParticles.geometry.attributes.position.needsUpdate = true;
    }

    // 4. Dragon Breathing & Idle Animation
    if (!reducedMotion) {
      const breath = Math.sin(elapsed * 1.8);
      this.dragonHead.rotation.x = Math.PI / 2 + breath * 0.08;
      this.dragonHead.rotation.y = mouseX * 0.25;
      this.dragonWingL.rotation.z = Math.sin(elapsed * 2.2) * 0.18;
      this.dragonWingR.rotation.z = -Math.sin(elapsed * 2.2) * 0.18;
      this.dragonTail.rotation.z = Math.sin(elapsed * 1.5) * 0.25;
    }

    // 5. Fire Torrent Climax (82% - 100% scroll progress)
    if (scrollProgress >= 0.82) {
      const prog = (scrollProgress - 0.82) / 0.18;
      this.fireOpacity = Math.sin(prog * Math.PI) * 0.95;
      (this.fireStream.material as THREE.PointsMaterial).opacity = this.fireOpacity;

      if (!reducedMotion) {
        for (let i = 0; i < this.firePositions.length / 3; i++) {
          this.firePositions[i * 3 + 2] += delta * (35 + Math.random() * 25);
          if (this.firePositions[i * 3 + 2] > 32) {
            this.firePositions[i * 3 + 2] = 0;
            this.firePositions[i * 3] = (Math.random() - 0.5) * 3;
            this.firePositions[i * 3 + 1] = (Math.random() - 0.5) * 3;
          }
        }
        this.fireStream.geometry.attributes.position.needsUpdate = true;
      }
    } else {
      (this.fireStream.material as THREE.PointsMaterial).opacity = 0;
    }
  }

  public dispose(): void {
    disposeWorldGroup(this.group);
    this.scene.remove(this.group);
  }
}
