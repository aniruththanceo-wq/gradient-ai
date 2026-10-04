/**
 * Gradient AI — The Living Forest Journey (Academic World)
 * Features:
 * - Forward camera travel along a winding forest path
 * - Dense canopy trees, sunbeams, and floating amber spore particles
 * - Wildlife crossing the road (deer, bison silhouettes)
 * - Deer cursor companion following with natural bounding gait & lag
 * - Tiger & Lion Encounter Climax: Stalking entry, tense standoff, leaping clash particles, peaceful resolution
 */

import * as THREE from "three";
import { disposeWorldGroup } from "./dispose";
import type { WorldUpdateParams } from "./ocean-world";

export class ForestWorld {
  public group: THREE.Group;
  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;

  // Environment
  private sunLight: THREE.DirectionalLight;
  private ambientGlow: THREE.PointLight;
  private roadMesh: THREE.Mesh;
  private treesGroup: THREE.Group;
  private wildlifeGroup: THREE.Group;
  private sporeParticles: THREE.Points;
  private sporePos: Float32Array;

  // Deer Cursor Companion
  private deerGroup: THREE.Group;
  private deerBody: THREE.Mesh;
  private deerHead: THREE.Mesh;
  private deerAntlers: THREE.Group;
  private deerPos = new THREE.Vector3(0, -2, 12);
  private deerVel = new THREE.Vector3(0, 0, 0);
  private deerTarget = new THREE.Vector3();

  // Tiger & Lion Climax Encounter
  private encounterGroup: THREE.Group;
  private tigerGroup: THREE.Group;
  private lionGroup: THREE.Group;
  private clashParticles: THREE.Points;
  private clashOpacity = 0.0;

  constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera, isMobile: boolean) {
    this.scene = scene;
    this.camera = camera;
    this.group = new THREE.Group();
    this.scene.add(this.group);
    this.scene.fog = new THREE.FogExp2(0x12271d, 0.011);
    this.group.add(new THREE.HemisphereLight(0xe9d8a6, 0x06140e, 1.25));

    // 1. Lighting (Warm golden forest sunbeams)
    this.sunLight = new THREE.DirectionalLight(0xfef08a, 2.8);
    this.sunLight.position.set(40, 70, 30);
    this.group.add(this.sunLight);

    this.ambientGlow = new THREE.PointLight(0x10b981, 1.8, 100);
    this.ambientGlow.position.set(0, 5, 0);
    this.group.add(this.ambientGlow);

    // 2. Forest Path / Road (Winding into the distance)
    const roadGeo = new THREE.PlaneGeometry(16, 320, 8, 48);
    roadGeo.rotateX(-Math.PI / 2);
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x1c1917,
      roughness: 0.9,
    });
    this.roadMesh = new THREE.Mesh(roadGeo, roadMat);
    this.roadMesh.position.set(0, -3.5, -120);
    this.group.add(this.roadMesh);

    // 3. Dense Forest Canopy Trees Lining the Road
    this.treesGroup = new THREE.Group();
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x3f2e21, roughness: 0.9 });
    const canopyMat = new THREE.MeshStandardMaterial({ color: 0x0b5d3b, roughness: 0.88, metalness: 0.0, flatShading: true });
    const treeCount = isMobile ? 25 : 65;

    for (let i = 0; i < treeCount; i++) {
      const tree = new THREE.Group();
      const trunkH = 8 + Math.random() * 6;
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.7, trunkH, 6), trunkMat);
      trunk.position.y = trunkH / 2 - 3.5;
      tree.add(trunk);

      const foliage = new THREE.Mesh(new THREE.SphereGeometry(3.5 + Math.random() * 2, 6, 6), canopyMat);
      foliage.position.y = trunkH - 2;
      tree.add(foliage);

      // Place along left and right of road
      const side = (i % 2 === 0 ? 1 : -1);
      const x = side * (12 + Math.random() * 35);
      const z = 20 - (i / treeCount) * 280;
      tree.position.set(x, 0, z);
      this.treesGroup.add(tree);
    }
    this.group.add(this.treesGroup);

    // 4. Wildlife Crossings (Silhouettes crossing the road)
    this.wildlifeGroup = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      const animal = new THREE.Group();
      const body = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.2, 3.0), new THREE.MeshStandardMaterial({ color: 0x1e293b }));
      body.position.y = -2;
      animal.add(body);
      animal.position.set(-30 + i * 20, 0, -40 - i * 50);
      this.wildlifeGroup.add(animal);
    }
    this.group.add(this.wildlifeGroup);

    // 5. Floating Amber Spore Particles
    const sporeCount = isMobile ? 120 : 350;
    const sporeGeo = new THREE.BufferGeometry();
    this.sporePos = new Float32Array(sporeCount * 3);
    for (let i = 0; i < sporeCount; i++) {
      this.sporePos[i * 3] = (Math.random() - 0.5) * 80;
      this.sporePos[i * 3 + 1] = -3 + Math.random() * 25;
      this.sporePos[i * 3 + 2] = 20 - Math.random() * 280;
    }
    sporeGeo.setAttribute("position", new THREE.BufferAttribute(this.sporePos, 3));
    this.sporeParticles = new THREE.Points(sporeGeo, new THREE.PointsMaterial({
      color: 0xfcd34d,
      size: 2.2,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    }));
    this.group.add(this.sporeParticles);

    // 6. Deer Cursor Companion
    this.deerGroup = new THREE.Group();
    const deerMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      emissive: 0x341205,
      emissiveIntensity: 0.08,
      roughness: 0.72,
    });
    this.deerBody = new THREE.Mesh(new THREE.CapsuleGeometry(0.7, 1.8, 6, 8), deerMat);
    this.deerBody.rotation.x = Math.PI / 2;
    this.deerGroup.add(this.deerBody);

    // Neck & Head
    this.deerHead = new THREE.Mesh(new THREE.ConeGeometry(0.45, 1.2, 5), deerMat);
    this.deerHead.position.set(0, 1.2, 1.0);
    this.deerHead.rotation.x = -Math.PI / 4;
    this.deerGroup.add(this.deerHead);

    // Antlers
    this.deerAntlers = new THREE.Group();
    const antlerMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const antL = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 1.2, 4), antlerMat);
    antL.rotation.z = Math.PI / 4;
    antL.position.set(0.4, 1.8, 0.8);
    const antR = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 1.2, 4), antlerMat);
    antR.rotation.z = -Math.PI / 4;
    antR.position.set(-0.4, 1.8, 0.8);
    this.deerAntlers.add(antL);
    this.deerAntlers.add(antR);
    this.deerGroup.add(this.deerAntlers);

    this.deerGroup.scale.setScalar(0.85);
    this.group.add(this.deerGroup);

    // 7. Tiger & Lion Climax Encounter (Deep along the forest road)
    this.encounterGroup = new THREE.Group();
    this.encounterGroup.position.set(0, 0, -220); // At the road climax

    // Tiger
    this.tigerGroup = new THREE.Group();
    const tigerMat = new THREE.MeshStandardMaterial({
      color: 0xea580c,
      emissive: 0x341205,
      emissiveIntensity: 0.08,
      roughness: 0.75,
    });
    const tigerBody = new THREE.Mesh(new THREE.CapsuleGeometry(1.2, 3.2, 6, 8), tigerMat);
    tigerBody.rotation.x = Math.PI / 2;
    this.tigerGroup.add(tigerBody);
    const tigerHead = new THREE.Mesh(new THREE.SphereGeometry(1.0, 8, 8), tigerMat);
    tigerHead.position.set(0, 0.8, 2.0);
    this.tigerGroup.add(tigerHead);
    this.tigerGroup.position.set(-15, -2.0, 0);
    this.encounterGroup.add(this.tigerGroup);

    // Lion
    this.lionGroup = new THREE.Group();
    const lionMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      emissive: 0x301504,
      emissiveIntensity: 0.06,
      roughness: 0.78,
    });
    const lionBody = new THREE.Mesh(new THREE.CapsuleGeometry(1.3, 3.4, 6, 8), lionMat);
    lionBody.rotation.x = Math.PI / 2;
    this.lionGroup.add(lionBody);
    const maneMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 });
    const lionMane = new THREE.Mesh(new THREE.SphereGeometry(1.8, 8, 8), maneMat);
    lionMane.position.set(0, 0.8, 2.0);
    this.lionGroup.add(lionMane);
    this.lionGroup.position.set(15, -2.0, 0);
    this.encounterGroup.add(this.lionGroup);

    // Clash Aura Particles
    const clashGeo = new THREE.BufferGeometry();
    const clashPositions = new Float32Array(150 * 3);
    for (let i = 0; i < 150; i++) {
      clashPositions[i * 3] = (Math.random() - 0.5) * 16;
      clashPositions[i * 3 + 1] = Math.random() * 12;
      clashPositions[i * 3 + 2] = (Math.random() - 0.5) * 16;
    }
    clashGeo.setAttribute("position", new THREE.BufferAttribute(clashPositions, 3));
    this.clashParticles = new THREE.Points(clashGeo, new THREE.PointsMaterial({
      color: 0xf59e0b,
      size: 3.0,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    }));
    this.encounterGroup.add(this.clashParticles);

    this.group.add(this.encounterGroup);
  }

  public update(params: WorldUpdateParams): void {
    const { scrollProgress, scrollVelocity, mouseX, mouseY, delta, elapsed, reducedMotion } = params;

    // 1. Forward Road Travel (z: +25 traveling forward to -215)
    const targetZ = 25 - scrollProgress * 230;
    const targetY = -0.5 + Math.sin(scrollProgress * Math.PI) * 4;
    const targetX = Math.sin(scrollProgress * Math.PI * 2) * 6 + mouseX * 4;

    if (!reducedMotion) {
      this.camera.position.z += (targetZ - this.camera.position.z) * 0.06;
      this.camera.position.y += (targetY - this.camera.position.y) * 0.06;
      this.camera.position.x += (targetX - this.camera.position.x) * 0.06;
      this.camera.rotation.y = -mouseX * 0.06;
      this.camera.rotation.x = (mouseY * 0.04) - (scrollVelocity * 0.002);
    } else {
      this.camera.position.set(0, targetY, targetZ);
    }

    // 2. Animate Wildlife Crossing
    if (!reducedMotion) {
      this.wildlifeGroup.children.forEach((w, idx) => {
        w.position.x += delta * (6.0 + idx * 2.0);
        if (w.position.x > 35) w.position.x = -35;
      });
    }

    // 3. Floating Spores Motion
    if (!reducedMotion) {
      for (let i = 0; i < this.sporePos.length / 3; i++) {
        this.sporePos[i * 3 + 1] += Math.sin(elapsed + i) * 0.02;
        this.sporePos[i * 3] += Math.cos(elapsed * 0.8 + i) * 0.02;
      }
      this.sporeParticles.geometry.attributes.position.needsUpdate = true;
    }

    // 4. Deer Companion Bounding Motion
    this.deerTarget.set(
      this.camera.position.x + mouseX * 10 + Math.sin(elapsed * 0.33) * 2.5,
      this.camera.position.y - 1.8 + mouseY * 4,
      this.camera.position.z - 16
    );
    this.deerTarget.sub(this.deerPos);
    this.deerVel.addScaledVector(this.deerTarget, 0.03);
    this.deerVel.multiplyScalar(0.85);
    this.deerPos.add(this.deerVel);
    this.deerGroup.position.copy(this.deerPos);

    if (!reducedMotion) {
      const speed = this.deerVel.length();
      this.deerGroup.position.y += Math.abs(Math.sin(elapsed * 8.0 * speed)) * 0.6; // Bounding hop
      this.deerGroup.rotation.y = -this.deerVel.x * 0.15;
    }

    // 5. Tiger & Lion Climax Encounter (82% - 100% scroll progress)
    if (scrollProgress >= 0.82) {
      const prog = (scrollProgress - 0.82) / 0.18; // 0.0 to 1.0

      if (prog < 0.4) {
        // Approaching onto the road
        this.tigerGroup.position.x = -15 + prog * 25; // Walks toward center
        this.lionGroup.position.x = 15 - prog * 25;
        this.clashOpacity = 0;
      } else if (prog >= 0.4 && prog < 0.85) {
        // Standoff & Leaping clash
        const clashIntensity = Math.sin(((prog - 0.4) / 0.45) * Math.PI);
        this.tigerGroup.position.set(-3 + clashIntensity * 1.5, -2 + clashIntensity * 2.0, 0);
        this.lionGroup.position.set(3 - clashIntensity * 1.5, -2 + clashIntensity * 2.0, 0);
        this.tigerGroup.rotation.z = -clashIntensity * 0.4;
        this.lionGroup.rotation.z = clashIntensity * 0.4;

        this.clashOpacity = clashIntensity * 0.9;
        (this.clashParticles.material as THREE.PointsMaterial).opacity = this.clashOpacity;
      } else {
        // Settling into tranquil woodland
        this.tigerGroup.position.set(-8, -2, 0);
        this.lionGroup.position.set(8, -2, 0);
        this.tigerGroup.rotation.z = 0;
        this.lionGroup.rotation.z = 0;
        this.clashOpacity = Math.max(0, this.clashOpacity - delta * 2);
        (this.clashParticles.material as THREE.PointsMaterial).opacity = this.clashOpacity;
      }
    } else {
      this.tigerGroup.position.set(-15, -2, 0);
      this.lionGroup.position.set(15, -2, 0);
      (this.clashParticles.material as THREE.PointsMaterial).opacity = 0;
    }
  }

  public dispose(): void {
    this.scene.remove(this.group);
    disposeWorldGroup(this.group);
  }
}
