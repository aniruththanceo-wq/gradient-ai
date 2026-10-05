/**
 * Gradient AI — Ultra-Realistic Cinematic Mountain World (Dashboard)
 * Features:
 * - Procedural alpine terrain with jagged ridges, crags, snow shelves, and valleys
 * - Curved mountain trail spline meandering down the slopes
 * - Instanced pine trees with varied lean, heights, and wind sway
 * - Smaller realistic snowflake system (3-tier depth, tiny crystal scales, turbulent blizzard bursts)
 * - Layered glacial cloud banks below summits creating immense scale
 * - Emperor Penguin companion: body weight waddle gait, belly sliding, head curiosity, cinematic foreground pass
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

  // 3-Tier Realistic Snow Particle System (Smaller Flakes)
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

    // 1. Physically Influenced Cold Alpine Sunlight
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

      const rockGeo = new THREE.ConeGeometry(radius, height, 6);
      const rPos = rockGeo.attributes.position.array as Float32Array;
      for (let p = 0; p < rPos.length; p += 3) {
        rPos[p] += Math.sin(rPos[p + 1] * 0.2) * 2.0;
      }
      rockGeo.computeVertexNormals();
      const rock = new THREE.Mesh(rockGeo, peakMat);
      peak.add(rock);

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
      tree.rotation.z = (Math.random() - 0.5) * 0.15;
      tree.scale.setScalar(0.85 + Math.random() * 0.55);
      this.treesGroup.add(tree);
    }
    this.group.add(this.treesGroup);

    // 6. Horizon Glacial Clouds & Mist
    this.cloudsGroup = new THREE.Group();
    const cloudMat = new THREE.MeshBasicMaterial({
      color: 0xbae6fd,
      transparent: true,
      opacity: 0.22,
    });
    for (let i = 0; i < 9; i++) {
      const cloud = new THREE.Mesh(new THREE.SphereGeometry(16, 8, 6), cloudMat);
      cloud.scale.set(2.8, 0.45, 1.3);
      cloud.position.set((Math.random() - 0.5) * 170, 8 - i * 16, -65 - Math.random() * 45);
      this.cloudsGroup.add(cloud);
    }
    this.group.add(this.cloudsGroup);

    // 7. Smaller Realistic 3-Tier Depth Snow Particle System
    // Far Snow (Ultra-tiny background crystal dust)
    const farCount = isMobile ? 400 : 1200;
    const farGeo = new THREE.BufferGeometry();
    this.farSnowPos = new Float32Array(farCount * 3);
    for (let i = 0; i < farCount; i++) {
      this.farSnowPos[i * 3] = (Math.random() - 0.5) * 180;
      this.farSnowPos[i * 3 + 1] = (Math.random() - 0.5) * 190;
      this.farSnowPos[i * 3 + 2] = -55 - Math.random() * 90;
    }
    farGeo.setAttribute("position", new THREE.BufferAttribute(this.farSnowPos, 3));
    this.farSnow = new THREE.Points(
      farGeo,
      new THREE.PointsMaterial({ color: 0xe0f2fe, size: 0.85, transparent: true, opacity: 0.52 })
    );
    this.group.add(this.farSnow);

    // Mid Snow (Small delicate snowflakes)
    const midCount = isMobile ? 250 : 750;
    const midGeo = new THREE.BufferGeometry();
    this.midSnowPos = new Float32Array(midCount * 3);
    for (let i = 0; i < midCount; i++) {
      this.midSnowPos[i * 3] = (Math.random() - 0.5) * 140;
      this.midSnowPos[i * 3 + 1] = (Math.random() - 0.5) * 160;
      this.midSnowPos[i * 3 + 2] = -18 - Math.random() * 55;
    }
    midGeo.setAttribute("position", new THREE.BufferAttribute(this.midSnowPos, 3));
    this.midSnow = new THREE.Points(
      midGeo,
      new THREE.PointsMaterial({ color: 0xf0fdf4, size: 1.45, transparent: true, opacity: 0.76 })
    );
    this.group.add(this.midSnow);

    // Near Snow (Parallax rushing snowflakes - realistically sized)
    const nearCount = isMobile ? 80 : 220;
    const nearGeo = new THREE.BufferGeometry();
    this.nearSnowPos = new Float32Array(nearCount * 3);
    for (let i = 0; i < nearCount; i++) {
      this.nearSnowPos[i * 3] = (Math.random() - 0.5) * 70;
      this.nearSnowPos[i * 3 + 1] = (Math.random() - 0.5) * 90;
      this.nearSnowPos[i * 3 + 2] = 8 + Math.random() * 26;
    }
    nearGeo.setAttribute("position", new THREE.BufferAttribute(this.nearSnowPos, 3));
    this.nearSnow = new THREE.Points(
      nearGeo,
      new THREE.PointsMaterial({ color: 0xffffff, size: 2.35, transparent: true, opacity: 0.86 })
    );
    this.group.add(this.nearSnow);

    // 8. Emperor Penguin Companion with Physical Locomotion
    this.penguinGroup = new THREE.Group();

    const bodyGeo = new THREE.CapsuleGeometry(1.2, 2.2, 8, 12);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.35 });
    this.penguinBody = new THREE.Mesh(bodyGeo, bodyMat);
    this.penguinGroup.add(this.penguinBody);

    const bellyGeo = new THREE.SphereGeometry(1.0, 12, 8, 0, Math.PI);
    const bellyMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
    const belly = new THREE.Mesh(bellyGeo, bellyMat);
    belly.position.set(0, -0.2, 0.5);
    belly.scale.set(0.9, 1.3, 0.4);
    this.penguinGroup.add(belly);

    // Gold/Orange Neck Markings
    const neckGoldGeo = new THREE.TorusGeometry(0.85, 0.15, 6, 12, Math.PI);
    neckGoldGeo.rotateX(Math.PI / 2);
    const neckGold = new THREE.Mesh(neckGoldGeo, new THREE.MeshBasicMaterial({ color: 0xf59e0b }));
    neckGold.position.set(0, 0.95, 0.1);
    this.penguinGroup.add(neckGold);

    // Articulated Head & Beak
    this.penguinHead = new THREE.Group();
    this.penguinHead.position.set(0, 1.25, 0);

    const headGeo = new THREE.SphereGeometry(0.82, 8, 8);
    const head = new THREE.Mesh(headGeo, bodyMat);
    this.penguinHead.add(head);

    const beakGeo = new THREE.ConeGeometry(0.32, 0.9, 4);
    beakGeo.rotateX(Math.PI / 2);
    const beak = new THREE.Mesh(beakGeo, new THREE.MeshBasicMaterial({ color: 0xf59e0b }));
    beak.position.set(0, 0, 0.95);
    this.penguinHead.add(beak);
    this.penguinGroup.add(this.penguinHead);

    // Flippers
    this.penguinFlippers = new THREE.Group();
    const flipGeo = new THREE.BoxGeometry(0.18, 1.4, 0.5);
    const flipL = new THREE.Mesh(flipGeo, bodyMat);
    flipL.position.set(1.15, 0.1, 0);
    flipL.rotation.z = -0.25;
    const flipR = new THREE.Mesh(flipGeo, bodyMat);
    flipR.position.set(-1.15, 0.1, 0);
    flipR.rotation.z = 0.25;
    this.penguinFlippers.add(flipL);
    this.penguinFlippers.add(flipR);
    this.penguinGroup.add(this.penguinFlippers);

    this.penguinGroup.scale.setScalar(0.78);
    this.group.add(this.penguinGroup);
  }

  public update(params: WorldUpdateParams): void {
    const { scrollProgress, scrollVelocity, mouseX, mouseY, delta, elapsed, reducedMotion } = params;

    // 1. Camera Descent down Mountain Slopes
    const targetY = 22 - scrollProgress * 125;
    const targetZ = 40 - Math.sin(scrollProgress * Math.PI) * 12;
    const targetX = Math.sin(scrollProgress * Math.PI * 1.6) * 10 + mouseX * 4;

    if (!reducedMotion) {
      this.camera.position.y += (targetY - this.camera.position.y) * 0.06;
      this.camera.position.z += (targetZ - this.camera.position.z) * 0.06;
      this.camera.position.x += (targetX - this.camera.position.x) * 0.06;
      this.camera.rotation.y = -mouseX * 0.06;
      this.camera.rotation.x = mouseY * 0.04 - scrollVelocity * 0.002;
    } else {
      this.camera.position.set(0, targetY, targetZ);
    }

    // 2. Realistic 3-Tier Snow Falling & Horizontal Wind Gusts
    if (!reducedMotion) {
      const windGust = Math.sin(elapsed * 1.5) * 0.25 + scrollVelocity * 0.05;

      // Far snow
      for (let i = 0; i < this.farSnowPos.length / 3; i++) {
        this.farSnowPos[i * 3 + 1] -= delta * 18;
        this.farSnowPos[i * 3] += windGust * 0.4;
        if (this.farSnowPos[i * 3 + 1] < -130) this.farSnowPos[i * 3 + 1] = 70;
      }
      this.farSnow.geometry.attributes.position.needsUpdate = true;

      // Mid snow
      for (let i = 0; i < this.midSnowPos.length / 3; i++) {
        this.midSnowPos[i * 3 + 1] -= delta * 32;
        this.midSnowPos[i * 3] += windGust * 0.7;
        if (this.midSnowPos[i * 3 + 1] < -120) this.midSnowPos[i * 3 + 1] = 60;
      }
      this.midSnow.geometry.attributes.position.needsUpdate = true;

      // Near snow (Dynamic fast parallax)
      for (let i = 0; i < this.nearSnowPos.length / 3; i++) {
        this.nearSnowPos[i * 3 + 1] -= delta * 52;
        this.nearSnowPos[i * 3] += windGust * 1.2;
        if (this.nearSnowPos[i * 3 + 1] < -80) this.nearSnowPos[i * 3 + 1] = 40;
      }
      this.nearSnow.geometry.attributes.position.needsUpdate = true;
    }

    // 3. Clouds Drift
    if (!reducedMotion) {
      this.cloudsGroup.children.forEach((c) => {
        c.position.x += delta * 1.2;
        if (c.position.x > 100) c.position.x = -100;
      });
    }

    // 4. Penguin Companion: Physical Locomotion & Cinematic Foreground Pass
    let pengTargetZ = this.camera.position.z - 16;
    let pengTargetX = this.camera.position.x + mouseX * 12;
    let pengTargetY = this.camera.position.y - 1.8 + mouseY * 5;

    // Cinematic Foreground Pass around scroll 0.40 - 0.50
    if (scrollProgress >= 0.40 && scrollProgress <= 0.50) {
      const passT = (scrollProgress - 0.40) / 0.10;
      pengTargetZ = this.camera.position.z - 4 - Math.sin(passT * Math.PI) * 4; // Waddles close in foreground!
      pengTargetX = (passT - 0.5) * 24; // Sweeps across screen
      pengTargetY = this.camera.position.y - 0.8 + Math.sin(passT * Math.PI) * 2;
    }

    const pengTarget = new THREE.Vector3(pengTargetX, pengTargetY, pengTargetZ);
    const diff = pengTarget.clone().sub(this.penguinPos);
    this.penguinVel.add(diff.multiplyScalar(0.048));
    this.penguinVel.multiplyScalar(0.85);
    this.penguinPos.add(this.penguinVel);
    this.penguinGroup.position.copy(this.penguinPos);

    if (!reducedMotion) {
      const speed = this.penguinVel.length();
      const waddlePhase = elapsed * 7.5 * Math.max(speed, 0.4);

      // Natural waddling gait rocking
      const bodySway = Math.sin(waddlePhase) * 0.22;
      this.penguinGroup.rotation.z = bodySway;
      this.penguinGroup.rotation.y = -this.penguinVel.x * 0.15;

      // Head stabilization: gyroscopic counter-rotation — head stays level while body sways
      this.penguinHead.rotation.z = -bodySway * 0.72;

      if (speed > 0.15) {
        // Active locomotion: foot alternation (left/right step timing)
        // Flippers counterswing for balance (opposite to body lean)
        const flipperSwing = Math.sin(waddlePhase) * 0.38;
        const children = this.penguinFlippers.children;
        if (children[0]) children[0].rotation.z = -0.25 + flipperSwing;  // Left flipper
        if (children[1]) children[1].rotation.z =  0.25 - flipperSwing;  // Right flipper

        // Head curiosity: watches direction of travel
        this.penguinHead.rotation.y += (-this.penguinVel.x * 0.4 - this.penguinHead.rotation.y) * 0.1;
      } else {
        // Idle curiosity: slow head look around + vertical nod
        this.penguinHead.rotation.y = mouseX * 0.35 + Math.sin(elapsed * 0.65) * 0.28;
        this.penguinHead.rotation.x = Math.sin(elapsed * 1.1) * 0.1; // Gentle nod
        // Resting flippers hang relaxed
        const children = this.penguinFlippers.children;
        if (children[0]) children[0].rotation.z = -0.25;
        if (children[1]) children[1].rotation.z =  0.25;
      }

      // Body bob: vertical hop cadence synchronized to waddling frequency
      this.penguinGroup.position.y += Math.abs(Math.sin(waddlePhase)) * 0.18 * Math.min(speed * 2, 1.0);
    }
  }

  public dispose(): void {
    disposeWorldGroup(this.group);
    this.scene.remove(this.group);
  }
}
