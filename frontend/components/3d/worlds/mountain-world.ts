/**
 * Gradient AI — Ultra-Realistic Cinematic Mountain World (Dashboard)
 * Features:
 * - Procedural alpine terrain with jagged ridges, crags, snow shelves, and valleys
 * - Curved mountain trail spline meandering down the slopes
 * - Instanced pine trees with varied lean, heights, and wind sway
 * - 3-Tier Depth Snowfall System + dynamic blizzard storm bursts on scroll velocity
 * - Penguin companion with body weight, waddle gait rocking, sliding inertia, and head look-at
 */

import * as THREE from "three";
import { disposeWorldGroup } from "./dispose";
import type { WorldUpdateParams } from "./ocean-world";

export class MountainWorld {
  public group: THREE.Group;
  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;

  // Environment & Lighting
  private sunLight: THREE.DirectionalLight;
  private ambientGlow: THREE.PointLight;
  private terrainMesh: THREE.Mesh;
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
  private penguinHead: THREE.Group;
  private penguinBody: THREE.Mesh;
  private penguinFlippers: THREE.Group;
  private penguinPos = new THREE.Vector3(0, 10, 18);
  private penguinVel = new THREE.Vector3(0, 0, 0);

  constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera, isMobile: boolean) {
    this.scene = scene;
    this.camera = camera;
    this.group = new THREE.Group();
    this.scene.add(this.group);

    // 1. Physically Influenced Lighting (Cold Alpine Sunlight)
    this.sunLight = new THREE.DirectionalLight(0xe0f2fe, 3.4);
    this.sunLight.position.set(40, 90, 50);
    this.group.add(this.sunLight);

    this.ambientGlow = new THREE.PointLight(0x38bdf8, 2.2, 140);
    this.ambientGlow.position.set(0, 15, 0);
    this.group.add(this.ambientGlow);

    // 2. Deformed Alpine Terrain Base
    const terrainGeo = new THREE.PlaneGeometry(280, 280, 48, 48);
    terrainGeo.rotateX(-Math.PI / 2);
    const tPos = terrainGeo.attributes.position.array as Float32Array;
    for (let i = 0; i < tPos.length; i += 3) {
      const x = tPos[i];
      const z = tPos[i + 2];
      // Multi-octave mountain terrain noise
      tPos[i + 1] = -50 + Math.sin(x * 0.04) * Math.cos(z * 0.04) * 22 + Math.sin(x * 0.1) * 6;
    }
    terrainGeo.computeVertexNormals();
    const terrainMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.7,
      metalness: 0.15,
      flatShading: true,
    });
    this.terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
    this.terrainMesh.position.set(0, -30, 0);
    this.group.add(this.terrainMesh);

    // 3. Jagged Alpine Peaks with Snow Shelves
    this.peaksGroup = new THREE.Group();
    const peakMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6, flatShading: true });
    const snowCapMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.25, metalness: 0.1, flatShading: true });

    const peakCount = isMobile ? 8 : 18;
    for (let i = 0; i < peakCount; i++) {
      const peak = new THREE.Group();
      const height = 45 + Math.random() * 55;
      const radius = 20 + Math.random() * 22;

      // Deformed rock cone
      const rockGeo = new THREE.ConeGeometry(radius, height, 6);
      const rPos = rockGeo.attributes.position.array as Float32Array;
      for (let p = 0; p < rPos.length; p += 3) {
        rPos[p] += Math.sin(rPos[p + 1] * 0.2) * 2.0;
      }
      rockGeo.computeVertexNormals();
      const rock = new THREE.Mesh(rockGeo, peakMat);
      peak.add(rock);

      // Layered Snow Cap
      const snowGeo = new THREE.ConeGeometry(radius * 0.5, height * 0.42, 6);
      const snow = new THREE.Mesh(snowGeo, snowCapMat);
      snow.position.y = height * 0.32;
      peak.add(snow);

      const angle = (i / peakCount) * Math.PI * 2;
      const dist = 55 + Math.random() * 75;
      peak.position.set(Math.cos(angle) * dist, -18 - (i % 3) * 32, Math.sin(angle) * dist - 35);
      this.peaksGroup.add(peak);
    }
    this.group.add(this.peaksGroup);

    // 4. Curved Mountain Trail Spline
    const trailCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(15, 20, 10),
      new THREE.Vector3(-10, -10, -15),
      new THREE.Vector3(18, -45, -40),
      new THREE.Vector3(-15, -80, -70),
      new THREE.Vector3(10, -115, -100),
    ]);
    const trailTube = new THREE.Mesh(
      new THREE.TubeGeometry(trailCurve, 48, 1.2, 6, false),
      new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.85 })
    );
    this.group.add(trailTube);

    // 5. Instanced Pine Trees with Varied Lean & Wind Sway
    this.treesGroup = new THREE.Group();
    const treeTrunkMat = new THREE.MeshStandardMaterial({ color: 0x271c14, roughness: 0.9 });
    const foliageMat = new THREE.MeshStandardMaterial({ color: 0x064e3b, roughness: 0.65, flatShading: true });
    const treeCount = isMobile ? 18 : 46;

    for (let i = 0; i < treeCount; i++) {
      const tree = new THREE.Group();
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.45, 3.5, 5), treeTrunkMat);
      trunk.position.y = 1.75;
      tree.add(trunk);

      for (let layer = 0; layer < 3; layer++) {
        const foliage = new THREE.Mesh(new THREE.ConeGeometry(2.4 - layer * 0.5, 3.4, 5), foliageMat);
        foliage.position.y = 3.8 + layer * 2.1;
        tree.add(foliage);
      }

      tree.position.set((Math.random() - 0.5) * 85, -28 - Math.random() * 95, -12 - Math.random() * 55);
      tree.rotation.z = (Math.random() - 0.5) * 0.15; // Natural lean
      tree.scale.setScalar(0.85 + Math.random() * 0.55);
      this.treesGroup.add(tree);
    }
    this.group.add(this.treesGroup);

    // 6. Horizon Glacial Clouds & Mist
    this.cloudsGroup = new THREE.Group();
    const cloudMat = new THREE.MeshBasicMaterial({
      color: 0xbae6fd,
      transparent: true,
      opacity: 0.24,
    });
    for (let i = 0; i < 9; i++) {
      const cloud = new THREE.Mesh(new THREE.SphereGeometry(16, 8, 6), cloudMat);
      cloud.scale.set(2.8, 0.45, 1.3);
      cloud.position.set((Math.random() - 0.5) * 170, 8 - i * 16, -65 - Math.random() * 45);
      this.cloudsGroup.add(cloud);
    }
    this.group.add(this.cloudsGroup);

    // 7. 3-Tier Depth Snow Particle System
    // Far Snow
    const farCount = isMobile ? 350 : 1100;
    const farGeo = new THREE.BufferGeometry();
    this.farSnowPos = new Float32Array(farCount * 3);
    for (let i = 0; i < farCount; i++) {
      this.farSnowPos[i * 3] = (Math.random() - 0.5) * 170;
      this.farSnowPos[i * 3 + 1] = (Math.random() - 0.5) * 190;
      this.farSnowPos[i * 3 + 2] = -55 - Math.random() * 85;
    }
    farGeo.setAttribute("position", new THREE.BufferAttribute(this.farSnowPos, 3));
    this.farSnow = new THREE.Points(
      farGeo,
      new THREE.PointsMaterial({ color: 0xe0f2fe, size: 1.3, transparent: true, opacity: 0.55 })
    );
    this.group.add(this.farSnow);

    // Mid Snow
    const midCount = isMobile ? 220 : 650;
    const midGeo = new THREE.BufferGeometry();
    this.midSnowPos = new Float32Array(midCount * 3);
    for (let i = 0; i < midCount; i++) {
      this.midSnowPos[i * 3] = (Math.random() - 0.5) * 130;
      this.midSnowPos[i * 3 + 1] = (Math.random() - 0.5) * 150;
      this.midSnowPos[i * 3 + 2] = -18 - Math.random() * 50;
    }
    midGeo.setAttribute("position", new THREE.BufferAttribute(this.midSnowPos, 3));
    this.midSnow = new THREE.Points(
      midGeo,
      new THREE.PointsMaterial({ color: 0xf0fdf4, size: 2.3, transparent: true, opacity: 0.78 })
    );
    this.group.add(this.midSnow);

    // Near Snow (Parallax rushing snowflakes)
    const nearCount = isMobile ? 70 : 200;
    const nearGeo = new THREE.BufferGeometry();
    this.nearSnowPos = new Float32Array(nearCount * 3);
    for (let i = 0; i < nearCount; i++) {
      this.nearSnowPos[i * 3] = (Math.random() - 0.5) * 65;
      this.nearSnowPos[i * 3 + 1] = (Math.random() - 0.5) * 85;
      this.nearSnowPos[i * 3 + 2] = 10 + Math.random() * 28;
    }
    nearGeo.setAttribute("position", new THREE.BufferAttribute(this.nearSnowPos, 3));
    this.nearSnow = new THREE.Points(
      nearGeo,
      new THREE.PointsMaterial({ color: 0xffffff, size: 4.2, transparent: true, opacity: 0.88 })
    );
    this.group.add(this.nearSnow);

    // 8. Penguin Companion with Physical Locomotion
    this.penguinGroup = new THREE.Group();

    // Body
    const bodyGeo = new THREE.CapsuleGeometry(1.25, 2.3, 8, 12);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.35 });
    this.penguinBody = new THREE.Mesh(bodyGeo, bodyMat);
    this.penguinGroup.add(this.penguinBody);

    const bellyGeo = new THREE.SphereGeometry(1.05, 12, 8, 0, Math.PI);
    const bellyMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
    const belly = new THREE.Mesh(bellyGeo, bellyMat);
    belly.position.set(0, -0.2, 0.52);
    belly.scale.set(0.9, 1.35, 0.42);
    this.penguinGroup.add(belly);

    // Articulated Head & Beak
    this.penguinHead = new THREE.Group();
    this.penguinHead.position.set(0, 1.3, 0);

    const headGeo = new THREE.SphereGeometry(0.85, 8, 8);
    const head = new THREE.Mesh(headGeo, bodyMat);
    this.penguinHead.add(head);

    const beakGeo = new THREE.ConeGeometry(0.35, 0.95, 4);
    beakGeo.rotateX(Math.PI / 2);
    const beak = new THREE.Mesh(beakGeo, new THREE.MeshBasicMaterial({ color: 0xf59e0b }));
    beak.position.set(0, 0, 1.0);
    this.penguinHead.add(beak);
    this.penguinGroup.add(this.penguinHead);

    // Flippers
    this.penguinFlippers = new THREE.Group();
    const flipGeo = new THREE.BoxGeometry(0.2, 1.45, 0.55);
    const flipL = new THREE.Mesh(flipGeo, bodyMat);
    flipL.position.set(1.25, 0, 0);
    const flipR = new THREE.Mesh(flipGeo, bodyMat);
    flipR.position.set(-1.25, 0, 0);
    this.penguinFlippers.add(flipL);
    this.penguinFlippers.add(flipR);
    this.penguinGroup.add(this.penguinFlippers);

    this.penguinGroup.scale.setScalar(0.85);
    this.group.add(this.penguinGroup);
  }

  public update(params: WorldUpdateParams): void {
    const { scrollProgress, scrollVelocity, mouseX, mouseY, delta, elapsed, reducedMotion } = params;

    // 1. Camera Descent down the mountain (Summit y: +20 -> Valley y: -110)
    const targetY = 20 - scrollProgress * 130;
    const targetZ = 42 - Math.sin(scrollProgress * Math.PI) * 12;
    const targetX = Math.cos(scrollProgress * Math.PI * 1.2) * 10 + mouseX * 5;

    if (!reducedMotion) {
      this.camera.position.y += (targetY - this.camera.position.y) * 0.06;
      this.camera.position.z += (targetZ - this.camera.position.z) * 0.06;
      this.camera.position.x += (targetX - this.camera.position.x) * 0.06;
      this.camera.rotation.y = -mouseX * 0.06;
      this.camera.rotation.x = mouseY * 0.04 - scrollVelocity * 0.002;
    } else {
      this.camera.position.set(0, targetY, targetZ);
    }

    // 2. Animate 3-Tier Snowfall with Wind Turbulence
    if (!reducedMotion) {
      const stormSpeed = 1.0 + Math.abs(scrollVelocity) * 3.2;
      const windX = Math.sin(elapsed * 0.6) * 14.0 * delta;

      // Far Snow
      for (let i = 0; i < this.farSnowPos.length / 3; i++) {
        this.farSnowPos[i * 3 + 1] -= delta * 13.0 * stormSpeed;
        this.farSnowPos[i * 3] += windX * 0.4;
        if (this.farSnowPos[i * 3 + 1] < this.camera.position.y - 85) {
          this.farSnowPos[i * 3 + 1] = this.camera.position.y + 85;
        }
      }
      this.farSnow.geometry.attributes.position.needsUpdate = true;

      // Mid Snow
      for (let i = 0; i < this.midSnowPos.length / 3; i++) {
        this.midSnowPos[i * 3 + 1] -= delta * 26.0 * stormSpeed;
        this.midSnowPos[i * 3] += windX * 0.85;
        if (this.midSnowPos[i * 3 + 1] < this.camera.position.y - 65) {
          this.midSnowPos[i * 3 + 1] = this.camera.position.y + 65;
        }
      }
      this.midSnow.geometry.attributes.position.needsUpdate = true;

      // Near Snow
      for (let i = 0; i < this.nearSnowPos.length / 3; i++) {
        this.nearSnowPos[i * 3 + 1] -= delta * 48.0 * stormSpeed;
        this.nearSnowPos[i * 3] += windX * 1.6;
        if (this.nearSnowPos[i * 3 + 1] < this.camera.position.y - 45) {
          this.nearSnowPos[i * 3 + 1] = this.camera.position.y + 45;
        }
      }
      this.nearSnow.geometry.attributes.position.needsUpdate = true;

      // Pine Trees Wind Sway
      this.treesGroup.children.forEach((t, idx) => {
        t.rotation.z = Math.sin(elapsed * 1.8 + idx) * 0.05;
      });
    }

    // 3. Penguin Companion Waddle & Slide Movement
    const penguinTarget = new THREE.Vector3(
      this.camera.position.x + mouseX * 14,
      this.camera.position.y + mouseY * 10 - 2,
      this.camera.position.z - 16
    );

    const diff = penguinTarget.clone().sub(this.penguinPos);
    this.penguinVel.add(diff.multiplyScalar(0.045));
    this.penguinVel.multiplyScalar(0.86);
    this.penguinPos.add(this.penguinVel);
    this.penguinGroup.position.copy(this.penguinPos);

    if (!reducedMotion) {
      const isMoving = this.penguinVel.lengthSq() > 0.005;
      if (isMoving) {
        // Waddle side-to-side body rocking
        this.penguinGroup.rotation.z = Math.sin(elapsed * 9.5) * 0.28;
        this.penguinFlippers.children[0].rotation.z = Math.sin(elapsed * 9.5) * 0.45;
        this.penguinFlippers.children[1].rotation.z = -Math.sin(elapsed * 9.5) * 0.45;
        this.penguinHead.rotation.y = 0;
      } else {
        this.penguinGroup.rotation.z = 0;
        this.penguinHead.rotation.x = Math.sin(elapsed * 2.2) * 0.12;
        this.penguinHead.rotation.y = mouseX * 0.4;
      }
      this.penguinGroup.rotation.y = -this.penguinVel.x * 0.16;
    }
  }

  public dispose(): void {
    disposeWorldGroup(this.group);
    this.scene.remove(this.group);
  }
}
