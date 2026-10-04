/**
 * Gradient AI — The Snowy Mountain Descent (Dashboard World)
 * Features:
 * - Mountain summit with glacial ridges, clouds, and icy sunlight glare
 * - Camera descent down snowy slopes, cliffs, and pine forests
 * - 3-Layer Snowfall System (far, mid, near) + blizzard storm acceleration on scroll velocity
 * - Penguin companion waddling & sliding to follow user cursor with natural lag
 */

import * as THREE from "three";
import type { WorldUpdateParams } from "./ocean-world";

export class MountainWorld {
  public group: THREE.Group;
  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;

  // Environment
  private sunLight: THREE.DirectionalLight;
  private ambientGlow: THREE.PointLight;
  private peaksGroup: THREE.Group;
  private treesGroup: THREE.Group;
  private cloudsGroup: THREE.Group;

  // 3-Tier Snow Particle System
  private farSnow: THREE.Points;
  private midSnow: THREE.Points;
  private nearSnow: THREE.Points;
  private farSnowPos: Float32Array;
  private midSnowPos: Float32Array;
  private nearSnowPos: Float32Array;

  // Penguin Companion
  private penguinGroup: THREE.Group;
  private penguinBody: THREE.Mesh;
  private penguinBeak: THREE.Mesh;
  private penguinFlippers: THREE.Group;
  private penguinPos = new THREE.Vector3(0, 0, 15);
  private penguinVel = new THREE.Vector3(0, 0, 0);

  constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera, isMobile: boolean) {
    this.scene = scene;
    this.camera = camera;
    this.group = new THREE.Group();
    this.scene.add(this.group);

    // 1. Lighting (Cold icy mountain sun)
    this.sunLight = new THREE.DirectionalLight(0xe0f2fe, 3.0);
    this.sunLight.position.set(30, 80, 40);
    this.group.add(this.sunLight);

    this.ambientGlow = new THREE.PointLight(0x38bdf8, 1.8, 120);
    this.ambientGlow.position.set(0, 10, 0);
    this.group.add(this.ambientGlow);

    // 2. Snow Peaks & Mountain Ridges
    this.peaksGroup = new THREE.Group();
    const peakMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.6,
      metalness: 0.2,
      flatShading: true,
    });
    const snowCapMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.3,
      metalness: 0.1,
      flatShading: true,
    });

    const peakCount = isMobile ? 8 : 18;
    for (let i = 0; i < peakCount; i++) {
      const peak = new THREE.Group();
      const height = 40 + Math.random() * 50;
      const radius = 18 + Math.random() * 20;
      
      const rock = new THREE.Mesh(new THREE.ConeGeometry(radius, height, 5), peakMat);
      peak.add(rock);

      // Snow Cap on Top
      const snowCap = new THREE.Mesh(new THREE.ConeGeometry(radius * 0.45, height * 0.4, 5), snowCapMat);
      snowCap.position.y = height * 0.3;
      peak.add(snowCap);

      const angle = (i / peakCount) * Math.PI * 2;
      const dist = 50 + Math.random() * 70;
      peak.position.set(Math.cos(angle) * dist, -20 - (i % 3) * 30, Math.sin(angle) * dist - 30);
      this.peaksGroup.add(peak);
    }
    this.group.add(this.peaksGroup);

    // 3. Pine Trees on Slopes
    this.treesGroup = new THREE.Group();
    const treeMat = new THREE.MeshStandardMaterial({ color: 0x064e3b, roughness: 0.7, flatShading: true });
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x271c14, roughness: 0.9 });
    const treeCount = isMobile ? 15 : 40;

    for (let i = 0; i < treeCount; i++) {
      const tree = new THREE.Group();
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 3, 5), trunkMat);
      trunk.position.y = 1.5;
      tree.add(trunk);

      for (let layer = 0; layer < 3; layer++) {
        const foliage = new THREE.Mesh(new THREE.ConeGeometry(2.2 - layer * 0.5, 3.2, 5), treeMat);
        foliage.position.y = 3.5 + layer * 2.0;
        tree.add(foliage);
      }

      tree.position.set((Math.random() - 0.5) * 80, -30 - Math.random() * 90, -10 - Math.random() * 50);
      tree.scale.setScalar(0.8 + Math.random() * 0.6);
      this.treesGroup.add(tree);
    }
    this.group.add(this.treesGroup);

    // 4. Horizon Clouds & Mist
    this.cloudsGroup = new THREE.Group();
    const cloudMat = new THREE.MeshBasicMaterial({
      color: 0xbae6fd,
      transparent: true,
      opacity: 0.22,
    });
    for (let i = 0; i < 8; i++) {
      const cloud = new THREE.Mesh(new THREE.SphereGeometry(15, 8, 6), cloudMat);
      cloud.scale.set(2.5, 0.4, 1.2);
      cloud.position.set((Math.random() - 0.5) * 160, 5 - i * 15, -60 - Math.random() * 40);
      this.cloudsGroup.add(cloud);
    }
    this.group.add(this.cloudsGroup);

    // 5. 3-Tier Snow Particle System
    // Far Snow
    const farCount = isMobile ? 300 : 1000;
    const farGeo = new THREE.BufferGeometry();
    this.farSnowPos = new Float32Array(farCount * 3);
    for (let i = 0; i < farCount; i++) {
      this.farSnowPos[i * 3] = (Math.random() - 0.5) * 160;
      this.farSnowPos[i * 3 + 1] = (Math.random() - 0.5) * 180;
      this.farSnowPos[i * 3 + 2] = -50 - Math.random() * 80;
    }
    farGeo.setAttribute("position", new THREE.BufferAttribute(this.farSnowPos, 3));
    this.farSnow = new THREE.Points(farGeo, new THREE.PointsMaterial({
      color: 0xe0f2fe,
      size: 1.2,
      transparent: true,
      opacity: 0.5,
    }));
    this.group.add(this.farSnow);

    // Mid Snow
    const midCount = isMobile ? 200 : 600;
    const midGeo = new THREE.BufferGeometry();
    this.midSnowPos = new Float32Array(midCount * 3);
    for (let i = 0; i < midCount; i++) {
      this.midSnowPos[i * 3] = (Math.random() - 0.5) * 120;
      this.midSnowPos[i * 3 + 1] = (Math.random() - 0.5) * 140;
      this.midSnowPos[i * 3 + 2] = -15 - Math.random() * 45;
    }
    midGeo.setAttribute("position", new THREE.BufferAttribute(this.midSnowPos, 3));
    this.midSnow = new THREE.Points(midGeo, new THREE.PointsMaterial({
      color: 0xf0fdf4,
      size: 2.2,
      transparent: true,
      opacity: 0.75,
    }));
    this.group.add(this.midSnow);

    // Near Snow (Large flakes rushing past camera)
    const nearCount = isMobile ? 60 : 180;
    const nearGeo = new THREE.BufferGeometry();
    this.nearSnowPos = new Float32Array(nearCount * 3);
    for (let i = 0; i < nearCount; i++) {
      this.nearSnowPos[i * 3] = (Math.random() - 0.5) * 60;
      this.nearSnowPos[i * 3 + 1] = (Math.random() - 0.5) * 80;
      this.nearSnowPos[i * 3 + 2] = 10 + Math.random() * 25;
    }
    nearGeo.setAttribute("position", new THREE.BufferAttribute(this.nearSnowPos, 3));
    this.nearSnow = new THREE.Points(nearGeo, new THREE.PointsMaterial({
      color: 0xffffff,
      size: 3.8,
      transparent: true,
      opacity: 0.85,
    }));
    this.group.add(this.nearSnow);

    // 6. Penguin Cursor Companion
    this.penguinGroup = new THREE.Group();

    // Body (Black back, white belly)
    const bodyGeo = new THREE.CapsuleGeometry(1.2, 2.2, 8, 12);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 });
    this.penguinBody = new THREE.Mesh(bodyGeo, bodyMat);
    this.penguinGroup.add(this.penguinBody);

    const bellyGeo = new THREE.SphereGeometry(1.0, 12, 8, 0, Math.PI);
    const bellyMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
    const belly = new THREE.Mesh(bellyGeo, bellyMat);
    belly.position.set(0, -0.2, 0.5);
    belly.scale.set(0.9, 1.3, 0.4);
    this.penguinGroup.add(belly);

    // Beak
    const beakGeo = new THREE.ConeGeometry(0.35, 0.9, 4);
    beakGeo.rotateX(Math.PI / 2);
    const beakMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    this.penguinBeak = new THREE.Mesh(beakGeo, beakMat);
    this.penguinBeak.position.set(0, 0.8, 1.2);
    this.penguinGroup.add(this.penguinBeak);

    // Flippers
    this.penguinFlippers = new THREE.Group();
    const flipGeo = new THREE.BoxGeometry(0.2, 1.4, 0.5);
    const flipMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });
    const flipL = new THREE.Mesh(flipGeo, flipMat);
    flipL.position.set(1.2, 0, 0);
    const flipR = new THREE.Mesh(flipGeo, flipMat);
    flipR.position.set(-1.2, 0, 0);
    this.penguinFlippers.add(flipL);
    this.penguinFlippers.add(flipR);
    this.penguinGroup.add(this.penguinFlippers);

    this.penguinGroup.scale.setScalar(0.85);
    this.group.add(this.penguinGroup);
  }

  public update(params: WorldUpdateParams): void {
    const { scrollProgress, scrollVelocity, mouseX, mouseY, delta, elapsed, reducedMotion } = params;

    // 1. Camera Descent down the mountain (y: +20 at summit down to -110 in lower valley)
    const targetY = 20 - scrollProgress * 130;
    const targetZ = 42 - Math.sin(scrollProgress * Math.PI) * 12;
    const targetX = Math.cos(scrollProgress * Math.PI * 1.2) * 10 + mouseX * 5;

    if (!reducedMotion) {
      this.camera.position.y += (targetY - this.camera.position.y) * 0.06;
      this.camera.position.z += (targetZ - this.camera.position.z) * 0.06;
      this.camera.position.x += (targetX - this.camera.position.x) * 0.06;
      this.camera.rotation.y = -mouseX * 0.06;
      this.camera.rotation.x = (mouseY * 0.04) - (scrollVelocity * 0.002);
    } else {
      this.camera.position.set(0, targetY, targetZ);
    }

    // 2. Animate 3-Tier Snowfall with Wind
    if (!reducedMotion) {
      const stormSpeed = 1.0 + Math.abs(scrollVelocity) * 3.0;
      const windX = Math.sin(elapsed * 0.5) * 12.0 * delta;

      // Far Snow
      for (let i = 0; i < this.farSnowPos.length / 3; i++) {
        this.farSnowPos[i * 3 + 1] -= delta * 12.0 * stormSpeed;
        this.farSnowPos[i * 3] += windX * 0.4;
        if (this.farSnowPos[i * 3 + 1] < this.camera.position.y - 80) {
          this.farSnowPos[i * 3 + 1] = this.camera.position.y + 80;
        }
      }
      this.farSnow.geometry.attributes.position.needsUpdate = true;

      // Mid Snow
      for (let i = 0; i < this.midSnowPos.length / 3; i++) {
        this.midSnowPos[i * 3 + 1] -= delta * 24.0 * stormSpeed;
        this.midSnowPos[i * 3] += windX * 0.8;
        if (this.midSnowPos[i * 3 + 1] < this.camera.position.y - 60) {
          this.midSnowPos[i * 3 + 1] = this.camera.position.y + 60;
        }
      }
      this.midSnow.geometry.attributes.position.needsUpdate = true;

      // Near Snow
      for (let i = 0; i < this.nearSnowPos.length / 3; i++) {
        this.nearSnowPos[i * 3 + 1] -= delta * 45.0 * stormSpeed;
        this.nearSnowPos[i * 3] += windX * 1.5;
        if (this.nearSnowPos[i * 3 + 1] < this.camera.position.y - 40) {
          this.nearSnowPos[i * 3 + 1] = this.camera.position.y + 40;
        }
      }
      this.nearSnow.geometry.attributes.position.needsUpdate = true;
    }

    // 3. Penguin Companion Waddle & Slide Movement
    const penguinTarget = new THREE.Vector3(
      this.camera.position.x + mouseX * 14,
      this.camera.position.y + mouseY * 10 - 2,
      this.camera.position.z - 16
    );

    const diff = penguinTarget.clone().sub(this.penguinPos);
    this.penguinVel.add(diff.multiplyScalar(0.04));
    this.penguinVel.multiplyScalar(0.86);
    this.penguinPos.add(this.penguinVel);
    this.penguinGroup.position.copy(this.penguinPos);

    if (!reducedMotion) {
      // Waddle tilt side to side while moving
      const isMoving = this.penguinVel.lengthSq() > 0.005;
      if (isMoving) {
        this.penguinGroup.rotation.z = Math.sin(elapsed * 9.0) * 0.25;
        this.penguinFlippers.children[0].rotation.z = Math.sin(elapsed * 9.0) * 0.4;
        this.penguinFlippers.children[1].rotation.z = -Math.sin(elapsed * 9.0) * 0.4;
      } else {
        this.penguinGroup.rotation.z = 0;
        this.penguinBeak.rotation.x = Math.sin(elapsed * 2.0) * 0.1;
      }
      this.penguinGroup.rotation.y = -this.penguinVel.x * 0.15;
    }
  }

  public dispose(): void {
    this.scene.remove(this.group);
    this.farSnow.geometry.dispose();
    (this.farSnow.material as THREE.Material).dispose();
    this.midSnow.geometry.dispose();
    (this.midSnow.material as THREE.Material).dispose();
    this.nearSnow.geometry.dispose();
    (this.nearSnow.material as THREE.Material).dispose();
  }
}
