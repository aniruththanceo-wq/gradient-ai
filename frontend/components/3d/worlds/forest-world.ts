/**
 * Gradient AI — Ultra-Realistic Cinematic Forest World (Academic)
 * Features:
 * - Winding spline forest road meandering through dense woodland
 * - Organic canopy trees with curved tapered trunks and branching crowns
 * - Dappled sunbeams and floating amber spore particles
 * - Wildlife crossings with natural cadence
 * - Deer cursor companion with bounding hop locomotion and spatial inertia
 * - Tiger & Lion Staged Climax: Predator entry, tense circling, leaping clash with aura arcs, peaceful settlement
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
  private roadCurve: THREE.CatmullRomCurve3;
  private treesGroup: THREE.Group;
  private wildlifeGroup: THREE.Group;
  private sporeParticles: THREE.Points;
  private sporePos: Float32Array;

  // Deer Cursor Companion
  private deerGroup: THREE.Group;
  private deerBody: THREE.Mesh;
  private deerHead: THREE.Group;
  private deerLegs: THREE.Group;
  private deerPos = new THREE.Vector3(0, -2, 14);
  private deerVel = new THREE.Vector3(0, 0, 0);

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

    // 1. Warm Dappled Canopy Sunlight
    this.sunLight = new THREE.DirectionalLight(0xfef08a, 3.2);
    this.sunLight.position.set(45, 80, 35);
    this.group.add(this.sunLight);

    this.ambientGlow = new THREE.PointLight(0x10b981, 2.0, 110);
    this.ambientGlow.position.set(0, 8, 0);
    this.group.add(this.ambientGlow);

    // 2. Winding Forest Road Spline (Meandering through the trees)
    this.roadCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -3.5, 30),
      new THREE.Vector3(8, -3.2, -20),
      new THREE.Vector3(-10, -3.0, -80),
      new THREE.Vector3(12, -3.4, -140),
      new THREE.Vector3(-6, -3.2, -200),
      new THREE.Vector3(0, -3.5, -260),
    ]);
    const roadGeo = new THREE.TubeGeometry(this.roadCurve, 64, 4.5, 6, false);
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.92 });
    this.roadMesh = new THREE.Mesh(roadGeo, roadMat);
    this.group.add(this.roadMesh);

    // 3. Organic Canopy Trees with Curved Tapered Trunks & Branches
    this.treesGroup = new THREE.Group();
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x382314, roughness: 0.88, flatShading: true });
    const canopyMat = new THREE.MeshStandardMaterial({ color: 0x065f46, roughness: 0.6, flatShading: true });
    const treeCount = isMobile ? 28 : 70;

    for (let i = 0; i < treeCount; i++) {
      const tree = new THREE.Group();
      const trunkH = 10 + Math.random() * 8;

      // Curved Trunk
      const trunkCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3((Math.random() - 0.5) * 1.5, trunkH * 0.5, (Math.random() - 0.5) * 1.5),
        new THREE.Vector3((Math.random() - 0.5) * 2.0, trunkH, (Math.random() - 0.5) * 2.0),
      ]);
      const trunkGeo = new THREE.TubeGeometry(trunkCurve, 8, 0.6, 6, false);
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      tree.add(trunk);

      // Branching Foliage Clusters
      for (let c = 0; c < 3; c++) {
        const foliage = new THREE.Mesh(new THREE.SphereGeometry(3.2 + Math.random() * 2.2, 7, 7), canopyMat);
        foliage.position.set((Math.random() - 0.5) * 3.5, trunkH + c * 1.8 - 1, (Math.random() - 0.5) * 3.5);
        tree.add(foliage);
      }

      // Position along the winding road
      const t = i / treeCount;
      const pt = this.roadCurve.getPointAt(t);
      const side = i % 2 === 0 ? 1 : -1;
      const offsetDist = 9 + Math.random() * 32;
      tree.position.set(pt.x + side * offsetDist, -3.5, pt.z);
      this.treesGroup.add(tree);
    }
    this.group.add(this.treesGroup);

    // 4. Wildlife Crossings with Cadence
    this.wildlifeGroup = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      const animal = new THREE.Group();
      const body = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.4, 3.2), new THREE.MeshStandardMaterial({ color: 0x1e293b }));
      body.position.y = -2;
      animal.add(body);
      animal.position.set(-35 + i * 22, 0, -45 - i * 55);
      this.wildlifeGroup.add(animal);
    }
    this.group.add(this.wildlifeGroup);

    // 5. Floating Amber Spores & Dust Particles
    const sporeCount = isMobile ? 140 : 380;
    const sporeGeo = new THREE.BufferGeometry();
    this.sporePos = new Float32Array(sporeCount * 3);
    for (let i = 0; i < sporeCount; i++) {
      this.sporePos[i * 3] = (Math.random() - 0.5) * 85;
      this.sporePos[i * 3 + 1] = -2 + Math.random() * 26;
      this.sporePos[i * 3 + 2] = 25 - Math.random() * 290;
    }
    sporeGeo.setAttribute("position", new THREE.BufferAttribute(this.sporePos, 3));
    this.sporeParticles = new THREE.Points(
      sporeGeo,
      new THREE.PointsMaterial({
        color: 0xfcd34d,
        size: 2.4,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
      })
    );
    this.group.add(this.sporeParticles);

    // 6. Deer Cursor Companion with Articulated Limbs & Antlers
    this.deerGroup = new THREE.Group();
    const deerMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      emissive: 0xb45309,
      emissiveIntensity: 0.4,
      roughness: 0.35,
    });

    // Body
    this.deerBody = new THREE.Mesh(new THREE.CapsuleGeometry(0.75, 1.9, 6, 8), deerMat);
    this.deerBody.rotation.x = Math.PI / 2;
    this.deerGroup.add(this.deerBody);

    // Articulated Head & Branching Antlers
    this.deerHead = new THREE.Group();
    this.deerHead.position.set(0, 1.3, 1.1);

    const headMesh = new THREE.Mesh(new THREE.ConeGeometry(0.45, 1.3, 5), deerMat);
    headMesh.rotation.x = -Math.PI / 4;
    this.deerHead.add(headMesh);

    // Branching Antlers
    const antlerMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    [-0.45, 0.45].forEach((x) => {
      const mainBranch = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 1.3, 4), antlerMat);
      mainBranch.rotation.z = (x > 0 ? 1 : -1) * (Math.PI / 4);
      mainBranch.position.set(x, 0.7, 0);

      const subBranch = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.6, 4), antlerMat);
      subBranch.rotation.x = Math.PI / 3;
      subBranch.position.set(0, 0.3, 0.2);
      mainBranch.add(subBranch);

      this.deerHead.add(mainBranch);
    });
    this.deerGroup.add(this.deerHead);

    // Legs
    this.deerLegs = new THREE.Group();
    const legGeo = new THREE.CylinderGeometry(0.1, 0.12, 1.6, 4);
    [[-0.4, 0.8], [0.4, 0.8], [-0.4, -0.8], [0.4, -0.8]].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(legGeo, deerMat);
      leg.position.set(lx, -1.0, lz);
      this.deerLegs.add(leg);
    });
    this.deerGroup.add(this.deerLegs);

    this.deerGroup.scale.setScalar(0.85);
    this.group.add(this.deerGroup);

    // 7. Tiger & Lion Climax Encounter (Deep along the forest road)
    this.encounterGroup = new THREE.Group();
    this.encounterGroup.position.set(0, 0, -225);

    // Tiger (Muscular predator silhouette)
    this.tigerGroup = new THREE.Group();
    const tigerMat = new THREE.MeshStandardMaterial({
      color: 0xea580c,
      emissive: 0xc2410c,
      emissiveIntensity: 0.45,
      roughness: 0.4,
    });
    const tigerBody = new THREE.Mesh(new THREE.CapsuleGeometry(1.25, 3.4, 6, 8), tigerMat);
    tigerBody.rotation.x = Math.PI / 2;
    this.tigerGroup.add(tigerBody);
    const tigerHead = new THREE.Mesh(new THREE.SphereGeometry(1.05, 8, 8), tigerMat);
    tigerHead.position.set(0, 0.85, 2.1);
    this.tigerGroup.add(tigerHead);
    this.tigerGroup.position.set(-16, -2.0, 0);
    this.encounterGroup.add(this.tigerGroup);

    // Lion (Regal mane & stance)
    this.lionGroup = new THREE.Group();
    const lionMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      emissive: 0x92400e,
      emissiveIntensity: 0.45,
      roughness: 0.5,
    });
    const lionBody = new THREE.Mesh(new THREE.CapsuleGeometry(1.35, 3.5, 6, 8), lionMat);
    lionBody.rotation.x = Math.PI / 2;
    this.lionGroup.add(lionBody);
    const lionMane = new THREE.Mesh(new THREE.SphereGeometry(1.9, 8, 8), new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.85 }));
    lionMane.position.set(0, 0.85, 2.1);
    this.lionGroup.add(lionMane);
    this.lionGroup.position.set(16, -2.0, 0);
    this.encounterGroup.add(this.lionGroup);

    // Clash Aura Particles
    const clashGeo = new THREE.BufferGeometry();
    const clashPositions = new Float32Array(180 * 3);
    for (let i = 0; i < 180; i++) {
      clashPositions[i * 3] = (Math.random() - 0.5) * 18;
      clashPositions[i * 3 + 1] = Math.random() * 14;
      clashPositions[i * 3 + 2] = (Math.random() - 0.5) * 18;
    }
    clashGeo.setAttribute("position", new THREE.BufferAttribute(clashPositions, 3));
    this.clashParticles = new THREE.Points(
      clashGeo,
      new THREE.PointsMaterial({
        color: 0xf59e0b,
        size: 3.2,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
      })
    );
    this.encounterGroup.add(this.clashParticles);

    this.group.add(this.encounterGroup);
  }

  public update(params: WorldUpdateParams): void {
    const { scrollProgress, scrollVelocity, mouseX, mouseY, delta, elapsed, reducedMotion } = params;

    // 1. Camera Tracking along Winding Road Spline
    const pathT = Math.min(Math.max(scrollProgress, 0), 1);
    const roadPt = this.roadCurve.getPointAt(pathT);
    const targetZ = roadPt.z + 15;
    const targetY = roadPt.y + 3.0;
    const targetX = roadPt.x + mouseX * 4;

    if (!reducedMotion) {
      this.camera.position.z += (targetZ - this.camera.position.z) * 0.06;
      this.camera.position.y += (targetY - this.camera.position.y) * 0.06;
      this.camera.position.x += (targetX - this.camera.position.x) * 0.06;
      this.camera.rotation.y = -mouseX * 0.06;
      this.camera.rotation.x = mouseY * 0.04 - scrollVelocity * 0.002;
    } else {
      this.camera.position.set(0, targetY, targetZ);
    }

    // 2. Animate Wildlife Crossing
    if (!reducedMotion) {
      this.wildlifeGroup.children.forEach((w, idx) => {
        w.position.x += delta * (6.5 + idx * 2.2);
        if (w.position.x > 38) w.position.x = -38;
      });
    }

    // 3. Floating Amber Spores Motion
    if (!reducedMotion) {
      for (let i = 0; i < this.sporePos.length / 3; i++) {
        this.sporePos[i * 3 + 1] += Math.sin(elapsed + i) * 0.025;
        this.sporePos[i * 3] += Math.cos(elapsed * 0.8 + i) * 0.025;
      }
      this.sporeParticles.geometry.attributes.position.needsUpdate = true;
    }

    // 4. Deer Companion Bounding Locomotion & Spatial Inertia
    const deerTarget = new THREE.Vector3(
      this.camera.position.x + mouseX * 14,
      this.camera.position.y - 1.8 + mouseY * 6,
      this.camera.position.z - 16
    );

    const diff = deerTarget.clone().sub(this.deerPos);
    this.deerVel.add(diff.multiplyScalar(0.045));
    this.deerVel.multiplyScalar(0.85);
    this.deerPos.add(this.deerVel);
    this.deerGroup.position.copy(this.deerPos);

    if (!reducedMotion) {
      const speed = this.deerVel.length();
      // Natural bounding hop
      this.deerGroup.position.y += Math.abs(Math.sin(elapsed * 8.5 * speed)) * 0.65;
      this.deerGroup.rotation.y = -this.deerVel.x * 0.16;
      this.deerHead.rotation.y = mouseX * 0.3;
    }

    // 5. Tiger & Lion Climax Encounter (82% - 100% scroll progress)
    if (scrollProgress >= 0.82) {
      const prog = (scrollProgress - 0.82) / 0.18; // 0.0 to 1.0

      if (prog < 0.38) {
        // Approaching onto the road
        this.tigerGroup.position.x = -16 + prog * 28;
        this.lionGroup.position.x = 16 - prog * 28;
        this.clashOpacity = 0;
      } else if (prog >= 0.38 && prog < 0.82) {
        // Standoff & Leaping clash
        const clashIntensity = Math.sin(((prog - 0.38) / 0.44) * Math.PI);
        this.tigerGroup.position.set(-3.2 + clashIntensity * 1.6, -2 + clashIntensity * 2.2, 0);
        this.lionGroup.position.set(3.2 - clashIntensity * 1.6, -2 + clashIntensity * 2.2, 0);
        this.tigerGroup.rotation.z = -clashIntensity * 0.45;
        this.lionGroup.rotation.z = clashIntensity * 0.45;

        this.clashOpacity = clashIntensity * 0.95;
        (this.clashParticles.material as THREE.PointsMaterial).opacity = this.clashOpacity;
      } else {
        // Peaceful woodland settlement
        this.tigerGroup.position.set(-8.5, -2, 0);
        this.lionGroup.position.set(8.5, -2, 0);
        this.tigerGroup.rotation.z = 0;
        this.lionGroup.rotation.z = 0;
        this.clashOpacity = Math.max(0, this.clashOpacity - delta * 2.5);
        (this.clashParticles.material as THREE.PointsMaterial).opacity = this.clashOpacity;
      }
    } else {
      this.tigerGroup.position.set(-16, -2, 0);
      this.lionGroup.position.set(16, -2, 0);
      (this.clashParticles.material as THREE.PointsMaterial).opacity = 0;
    }
  }

  public dispose(): void {
    disposeWorldGroup(this.group);
    this.scene.remove(this.group);
  }
}
