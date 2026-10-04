/**
 * Gradient AI — Ultra-Realistic Cinematic Forest World (Academic Intelligence)
 * Features:
 * - Multi-tier ancient woodland: foreground framing trees, midground forest, distant canopy silhouettes
 * - Winding spline earthen road with natural elevation dips, boulders, and mossy fallen logs
 * - Dappled volumetric sunlight shafts (godrays), floating amber spores & drifting woodland mist
 * - Stag Deer Companion: quadruped gait, multi-tined branching antlers, bounding leap, foreground pass
 * - Tiger (Extreme Detail): muscular shoulders, broad chest, sinuous spine, articulated legs, paws, striped coat, predatory gait
 * - Lion (Extreme Detail): massive muscular chest, layered volumetric mane, noble head, tufted tail, heavy deliberate stride
 * - Staged Wildlife Encounter: foreshadowing silence, stalking entry, tense circling, leaping clash with aura arcs, peaceful resolution
 */

import * as THREE from "three";
import { disposeWorldGroup } from "./dispose";
import type { WorldUpdateParams } from "./ocean-world";

export class ForestWorld {
  public group: THREE.Group;
  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;

  // Lighting & Atmosphere
  private sunLight: THREE.DirectionalLight;
  private ambientGlow: THREE.PointLight;
  private godRays: THREE.Group;
  private roadMesh: THREE.Mesh;
  private roadCurve: THREE.CatmullRomCurve3;
  private treesGroup: THREE.Group;
  private forestDetails: THREE.Group;
  private sporeParticles: THREE.Points;
  private sporePos: Float32Array;

  // Stag Deer Companion
  private deerGroup: THREE.Group;
  private deerBody: THREE.Mesh;
  private deerHead: THREE.Group;
  private deerLegFL: THREE.Mesh;
  private deerLegFR: THREE.Mesh;
  private deerLegBL: THREE.Mesh;
  private deerLegBR: THREE.Mesh;
  private deerPos = new THREE.Vector3(0, -2, 14);
  private deerVel = new THREE.Vector3(0, 0, 0);

  // Tiger & Lion Climax Encounter
  private encounterGroup: THREE.Group;
  private tigerGroup: THREE.Group;
  private tigerSpine: THREE.Mesh;
  private tigerHead: THREE.Group;
  private tigerTail: THREE.Mesh;
  private tigerLegFL: THREE.Mesh;
  private tigerLegFR: THREE.Mesh;
  private tigerLegBL: THREE.Mesh;
  private tigerLegBR: THREE.Mesh;

  private lionGroup: THREE.Group;
  private lionChest: THREE.Mesh;
  private lionMane: THREE.Group;
  private lionHead: THREE.Group;
  private lionTail: THREE.Mesh;
  private lionLegFL: THREE.Mesh;
  private lionLegFR: THREE.Mesh;
  private lionLegBL: THREE.Mesh;
  private lionLegBR: THREE.Mesh;

  private clashParticles: THREE.Points;
  private clashOpacity = 0.0;

  constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera, isMobile: boolean) {
    this.scene = scene;
    this.camera = camera;
    this.group = new THREE.Group();
    this.scene.add(this.group);

    // 1. Physically Influenced Warm Canopy Sunlight & Emerald Bounce
    this.sunLight = new THREE.DirectionalLight(0xfef08a, 3.4);
    this.sunLight.position.set(45, 85, 40);
    this.group.add(this.sunLight);

    this.ambientGlow = new THREE.PointLight(0x10b981, 2.2, 130);
    this.ambientGlow.position.set(0, 10, -50);
    this.group.add(this.ambientGlow);

    // Volumetric Godrays (Dappled sunlight shafts)
    this.godRays = new THREE.Group();
    const rayMat = new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      transparent: true,
      opacity: 0.12,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    for (let i = 0; i < 5; i++) {
      const rayGeo = new THREE.CylinderGeometry(0.6, 12.0, 85, 8, 1, true);
      const ray = new THREE.Mesh(rayGeo, rayMat);
      ray.position.set(-25 + i * 14, 25, -20 - i * 45);
      ray.rotation.z = 0.22;
      ray.rotation.x = -0.15;
      this.godRays.add(ray);
    }
    this.group.add(this.godRays);

    // 2. Winding Forest Road Spline (Natural Elevation & Curves)
    this.roadCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -3.5, 35),
      new THREE.Vector3(7, -3.2, -15),
      new THREE.Vector3(-9, -2.8, -75),
      new THREE.Vector3(11, -3.4, -135),
      new THREE.Vector3(-8, -3.0, -195),
      new THREE.Vector3(0, -3.5, -265),
    ]);
    const roadGeo = new THREE.TubeGeometry(this.roadCurve, 80, 4.8, 8, false);
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x1c1917,
      roughness: 0.95,
      metalness: 0.05,
      flatShading: true,
    });
    this.roadMesh = new THREE.Mesh(roadGeo, roadMat);
    this.group.add(this.roadMesh);

    // 3. Multi-Tier Forest Trees (Curved Tapered Trunks & Branch Hierarchies)
    this.treesGroup = new THREE.Group();
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x2e1a0f, roughness: 0.9, flatShading: true });
    const canopyMat = new THREE.MeshStandardMaterial({ color: 0x064e3b, roughness: 0.65, flatShading: true });
    const treeCount = isMobile ? 32 : 85;

    for (let i = 0; i < treeCount; i++) {
      const tree = new THREE.Group();
      const trunkH = 11 + Math.random() * 9;

      // Curved Spline Trunk
      const trunkCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3((Math.random() - 0.5) * 1.8, trunkH * 0.45, (Math.random() - 0.5) * 1.8),
        new THREE.Vector3((Math.random() - 0.5) * 2.2, trunkH, (Math.random() - 0.5) * 2.2),
      ]);
      const trunkGeo = new THREE.TubeGeometry(trunkCurve, 10, 0.7, 6, false);
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      tree.add(trunk);

      // Branching Foliage Clusters
      for (let c = 0; c < 4; c++) {
        const foliage = new THREE.Mesh(
          new THREE.SphereGeometry(3.5 + Math.random() * 2.4, 7, 6),
          canopyMat
        );
        foliage.position.set(
          (Math.random() - 0.5) * 4.2,
          trunkH + c * 1.7 - 1.5,
          (Math.random() - 0.5) * 4.2
        );
        tree.add(foliage);
      }

      // Position along the winding road
      const t = i / treeCount;
      const pt = this.roadCurve.getPointAt(t);
      const side = i % 2 === 0 ? 1 : -1;
      const offsetDist = 8.5 + Math.random() * 38;
      tree.position.set(pt.x + side * offsetDist, -3.5, pt.z);
      this.treesGroup.add(tree);
    }
    this.group.add(this.treesGroup);

    // 4. Forest Details: Mossy Boulders & Fallen Logs along the shoulders
    this.forestDetails = new THREE.Group();
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.85, flatShading: true });
    for (let i = 0; i < 16; i++) {
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(1.6 + Math.random() * 1.4), rockMat);
      const pt = this.roadCurve.getPointAt((i + 0.5) / 16);
      const side = i % 2 === 0 ? 1 : -1;
      rock.position.set(pt.x + side * (5.5 + Math.random() * 3), -3.2, pt.z);
      this.forestDetails.add(rock);
    }
    this.group.add(this.forestDetails);

    // 5. Floating Amber Forest Spores & Drifting Mist
    const sporeCount = isMobile ? 160 : 420;
    const sporeGeo = new THREE.BufferGeometry();
    this.sporePos = new Float32Array(sporeCount * 3);
    for (let i = 0; i < sporeCount; i++) {
      this.sporePos[i * 3] = (Math.random() - 0.5) * 95;
      this.sporePos[i * 3 + 1] = -2 + Math.random() * 28;
      this.sporePos[i * 3 + 2] = 30 - Math.random() * 300;
    }
    sporeGeo.setAttribute("position", new THREE.BufferAttribute(this.sporePos, 3));
    this.sporeParticles = new THREE.Points(
      sporeGeo,
      new THREE.PointsMaterial({
        color: 0xfcd34d,
        size: 2.2,
        transparent: true,
        opacity: 0.82,
        blending: THREE.AdditiveBlending,
      })
    );
    this.group.add(this.sporeParticles);

    // 6. Stag Deer Companion (Articulated Quadruped with Branching Antlers)
    this.deerGroup = new THREE.Group();
    const deerMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      emissive: 0xb45309,
      emissiveIntensity: 0.42,
      roughness: 0.38,
    });

    // Anatomical Torso Capsule
    this.deerBody = new THREE.Mesh(new THREE.CapsuleGeometry(0.8, 2.2, 8, 10), deerMat);
    this.deerBody.rotation.x = Math.PI / 2;
    this.deerGroup.add(this.deerBody);

    // Neck & Sculpted Head
    this.deerHead = new THREE.Group();
    this.deerHead.position.set(0, 1.4, 1.2);

    const headMesh = new THREE.Mesh(new THREE.ConeGeometry(0.48, 1.4, 6), deerMat);
    headMesh.rotation.x = -Math.PI / 4;
    this.deerHead.add(headMesh);

    // Multi-tined Branching Antlers
    const antlerMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    [-0.45, 0.45].forEach((x) => {
      const mainBranch = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, 1.4, 4), antlerMat);
      mainBranch.rotation.z = (x > 0 ? 1 : -1) * (Math.PI / 4.2);
      mainBranch.position.set(x, 0.75, 0);

      const subBranch1 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.65, 4), antlerMat);
      subBranch1.rotation.x = Math.PI / 3;
      subBranch1.position.set(0, 0.3, 0.22);
      mainBranch.add(subBranch1);

      const subBranch2 = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.45, 4), antlerMat);
      subBranch2.rotation.x = -Math.PI / 4;
      subBranch2.position.set(0, 0.6, -0.15);
      mainBranch.add(subBranch2);

      this.deerHead.add(mainBranch);
    });
    this.deerGroup.add(this.deerHead);

    // Articulated Legs
    const deerLegGeo = new THREE.CylinderGeometry(0.1, 0.12, 1.7, 4);
    this.deerLegFL = new THREE.Mesh(deerLegGeo, deerMat);
    this.deerLegFL.position.set(-0.4, -1.0, 0.85);
    this.deerLegFR = new THREE.Mesh(deerLegGeo, deerMat);
    this.deerLegFR.position.set(0.4, -1.0, 0.85);
    this.deerLegBL = new THREE.Mesh(deerLegGeo, deerMat);
    this.deerLegBL.position.set(-0.4, -1.0, -0.85);
    this.deerLegBR = new THREE.Mesh(deerLegGeo, deerMat);
    this.deerLegBR.position.set(0.4, -1.0, -0.85);

    this.deerGroup.add(this.deerLegFL);
    this.deerGroup.add(this.deerLegFR);
    this.deerGroup.add(this.deerLegBL);
    this.deerGroup.add(this.deerLegBR);

    this.deerGroup.scale.setScalar(0.85);
    this.group.add(this.deerGroup);

    // 7. Tiger & Lion Climax Encounter (Deep Forest Standoff)
    this.encounterGroup = new THREE.Group();
    this.encounterGroup.position.set(0, 0, -225);

    // ----------------------------------------------------
    // TIGER (Extreme Detail Anatomical Build)
    // ----------------------------------------------------
    this.tigerGroup = new THREE.Group();
    const tigerMat = new THREE.MeshStandardMaterial({
      color: 0xea580c,
      emissive: 0xc2410c,
      emissiveIntensity: 0.48,
      roughness: 0.36,
      metalness: 0.15,
    });
    const stripeMat = new THREE.MeshStandardMaterial({
      color: 0x1c1917,
      roughness: 0.9,
    });

    // Muscular Chest & Sinuous Spine
    this.tigerSpine = new THREE.Mesh(new THREE.CapsuleGeometry(1.35, 3.8, 8, 12), tigerMat);
    this.tigerSpine.rotation.x = Math.PI / 2;
    this.tigerGroup.add(this.tigerSpine);

    // Striped Rib Rings
    for (let r = 0; r < 4; r++) {
      const stripeRing = new THREE.Mesh(new THREE.TorusGeometry(1.37, 0.08, 4, 12), stripeMat);
      stripeRing.position.set(0, 0, -1.2 + r * 0.8);
      this.tigerGroup.add(stripeRing);
    }

    // Sculpted Head & Jaws
    this.tigerHead = new THREE.Group();
    this.tigerHead.position.set(0, 1.0, 2.4);

    const tigerSkull = new THREE.Mesh(new THREE.SphereGeometry(1.15, 8, 8), tigerMat);
    this.tigerHead.add(tigerSkull);

    const tigerMuzzle = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.7, 0.9), tigerMat);
    tigerMuzzle.position.set(0, -0.3, 0.85);
    this.tigerHead.add(tigerMuzzle);

    // Piercing Amber Eyes
    const eyeAmber = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
    const eyeTL = new THREE.Mesh(new THREE.SphereGeometry(0.18, 6, 6), eyeAmber);
    eyeTL.position.set(0.42, 0.25, 0.95);
    const eyeTR = new THREE.Mesh(new THREE.SphereGeometry(0.18, 6, 6), eyeAmber);
    eyeTR.position.set(-0.42, 0.25, 0.95);
    this.tigerHead.add(eyeTL);
    this.tigerHead.add(eyeTR);

    // Rounded Feline Ears
    const earGeo = new THREE.ConeGeometry(0.35, 0.6, 4);
    const earTL = new THREE.Mesh(earGeo, tigerMat);
    earTL.position.set(0.65, 0.95, 0.1);
    const earTR = new THREE.Mesh(earGeo, tigerMat);
    earTR.position.set(-0.65, 0.95, 0.1);
    this.tigerHead.add(earTL);
    this.tigerHead.add(earTR);

    this.tigerGroup.add(this.tigerHead);

    // Expressive Undulating Tail
    const tailGeo = new THREE.CylinderGeometry(0.15, 0.25, 3.2, 6);
    tailGeo.rotateX(-Math.PI / 3);
    this.tigerTail = new THREE.Mesh(tailGeo, tigerMat);
    this.tigerTail.position.set(0, 0.6, -2.4);
    this.tigerGroup.add(this.tigerTail);

    // Muscular Quadruped Legs & Paws
    const catLegGeo = new THREE.CylinderGeometry(0.32, 0.42, 2.2, 6);
    this.tigerLegFL = new THREE.Mesh(catLegGeo, tigerMat);
    this.tigerLegFL.position.set(0.85, -1.2, 1.4);
    this.tigerLegFR = new THREE.Mesh(catLegGeo, tigerMat);
    this.tigerLegFR.position.set(-0.85, -1.2, 1.4);
    this.tigerLegBL = new THREE.Mesh(catLegGeo, tigerMat);
    this.tigerLegBL.position.set(0.85, -1.2, -1.4);
    this.tigerLegBR = new THREE.Mesh(catLegGeo, tigerMat);
    this.tigerLegBR.position.set(-0.85, -1.2, -1.4);

    this.tigerGroup.add(this.tigerLegFL);
    this.tigerGroup.add(this.tigerLegFR);
    this.tigerGroup.add(this.tigerLegBL);
    this.tigerGroup.add(this.tigerLegBR);

    this.tigerGroup.position.set(-16, -2.0, 0);
    this.encounterGroup.add(this.tigerGroup);

    // ----------------------------------------------------
    // LION (Extreme Detail Regal Build & Volumetric Mane)
    // ----------------------------------------------------
    this.lionGroup = new THREE.Group();
    const lionMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      emissive: 0x92400e,
      emissiveIntensity: 0.46,
      roughness: 0.45,
    });
    const maneMat = new THREE.MeshStandardMaterial({
      color: 0x78350f,
      emissive: 0x451a03,
      emissiveIntensity: 0.35,
      roughness: 0.85,
    });

    // Massive Muscular Torso
    this.lionChest = new THREE.Mesh(new THREE.CapsuleGeometry(1.5, 3.9, 8, 12), lionMat);
    this.lionChest.rotation.x = Math.PI / 2;
    this.lionGroup.add(this.lionChest);

    // Layered Volumetric Mane
    this.lionMane = new THREE.Group();
    this.lionMane.position.set(0, 1.1, 2.0);

    const maneOuter = new THREE.Mesh(new THREE.SphereGeometry(2.2, 8, 8), maneMat);
    maneOuter.scale.set(1.1, 1.15, 0.95);
    this.lionMane.add(maneOuter);

    const maneInner = new THREE.Mesh(new THREE.SphereGeometry(1.85, 8, 8), maneMat);
    maneInner.position.set(0, -0.3, 0.3);
    this.lionMane.add(maneInner);
    this.lionGroup.add(this.lionMane);

    // Noble Head & Muzzle
    this.lionHead = new THREE.Group();
    this.lionHead.position.set(0, 1.1, 2.5);

    const lionSkull = new THREE.Mesh(new THREE.SphereGeometry(1.05, 8, 8), lionMat);
    this.lionHead.add(lionSkull);

    const lionMuzzle = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.8, 1.0), lionMat);
    lionMuzzle.position.set(0, -0.35, 0.75);
    this.lionHead.add(lionMuzzle);

    const eyeLL = new THREE.Mesh(new THREE.SphereGeometry(0.18, 6, 6), eyeAmber);
    eyeLL.position.set(0.4, 0.2, 0.85);
    const eyeLR = new THREE.Mesh(new THREE.SphereGeometry(0.18, 6, 6), eyeAmber);
    eyeLR.position.set(-0.4, 0.2, 0.85);
    this.lionHead.add(eyeLL);
    this.lionHead.add(eyeLR);

    this.lionGroup.add(this.lionHead);

    // Tufted Tail
    const lionTailGeo = new THREE.CylinderGeometry(0.16, 0.26, 3.4, 6);
    lionTailGeo.rotateX(-Math.PI / 3);
    this.lionTail = new THREE.Mesh(lionTailGeo, lionMat);
    this.lionTail.position.set(0, 0.6, -2.5);
    const tuft = new THREE.Mesh(new THREE.SphereGeometry(0.4, 6, 6), maneMat);
    tuft.position.set(0, -1.3, -0.8);
    this.lionTail.add(tuft);
    this.lionGroup.add(this.lionTail);

    // Heavy Quadruped Legs & Paws
    const lionLegGeo = new THREE.CylinderGeometry(0.36, 0.46, 2.3, 6);
    this.lionLegFL = new THREE.Mesh(lionLegGeo, lionMat);
    this.lionLegFL.position.set(0.95, -1.25, 1.4);
    this.lionLegFR = new THREE.Mesh(lionLegGeo, lionMat);
    this.lionLegFR.position.set(-0.95, -1.25, 1.4);
    this.lionLegBL = new THREE.Mesh(lionLegGeo, lionMat);
    this.lionLegBL.position.set(0.95, -1.25, -1.4);
    this.lionLegBR = new THREE.Mesh(lionLegGeo, lionMat);
    this.lionLegBR.position.set(-0.95, -1.25, -1.4);

    this.lionGroup.add(this.lionLegFL);
    this.lionGroup.add(this.lionLegFR);
    this.lionGroup.add(this.lionLegBL);
    this.lionGroup.add(this.lionLegBR);

    this.lionGroup.position.set(16, -2.0, 0);
    this.encounterGroup.add(this.lionGroup);

    // Radiant Clash Aura Particles
    const clashGeo = new THREE.BufferGeometry();
    const clashPositions = new Float32Array(220 * 3);
    for (let i = 0; i < 220; i++) {
      clashPositions[i * 3] = (Math.random() - 0.5) * 22;
      clashPositions[i * 3 + 1] = Math.random() * 16;
      clashPositions[i * 3 + 2] = (Math.random() - 0.5) * 22;
    }
    clashGeo.setAttribute("position", new THREE.BufferAttribute(clashPositions, 3));
    this.clashParticles = new THREE.Points(
      clashGeo,
      new THREE.PointsMaterial({
        color: 0xf59e0b,
        size: 3.4,
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
    const targetZ = roadPt.z + 16;
    const targetY = roadPt.y + 3.2;
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

    // 2. Floating Amber Spores & Dappled Light Motion
    if (!reducedMotion) {
      for (let i = 0; i < this.sporePos.length / 3; i++) {
        this.sporePos[i * 3 + 1] += Math.sin(elapsed + i) * 0.025;
        this.sporePos[i * 3] += Math.cos(elapsed * 0.8 + i) * 0.025;
      }
      this.sporeParticles.geometry.attributes.position.needsUpdate = true;
    }

    // 3. Stag Deer Companion: Physical Spring Locomotion & Cinematic Foreground Leap
    let deerTargetZ = this.camera.position.z - 16;
    let deerTargetX = this.camera.position.x + mouseX * 12;
    let deerTargetY = this.camera.position.y - 1.8 + mouseY * 5;

    // Foreground Leap event around scroll 0.45 - 0.55
    if (scrollProgress >= 0.45 && scrollProgress <= 0.55) {
      const leapT = (scrollProgress - 0.45) / 0.10;
      deerTargetZ = this.camera.position.z - 4 - Math.sin(leapT * Math.PI) * 5; // Passes close in foreground!
      deerTargetX = (leapT - 0.5) * 28; // Sweeps across screen
      deerTargetY = this.camera.position.y - 0.5 + Math.sin(leapT * Math.PI) * 3;
    }

    const deerTarget = new THREE.Vector3(deerTargetX, deerTargetY, deerTargetZ);
    const diff = deerTarget.clone().sub(this.deerPos);
    this.deerVel.add(diff.multiplyScalar(0.048));
    this.deerVel.multiplyScalar(0.84);
    this.deerPos.add(this.deerVel);
    this.deerGroup.position.copy(this.deerPos);

    if (!reducedMotion) {
      const speed = this.deerVel.length();
      // Natural bounding quadruped gallop
      const hopPhase = elapsed * 8.5 * speed;
      this.deerGroup.position.y += Math.abs(Math.sin(hopPhase)) * 0.75;
      this.deerGroup.rotation.y = -this.deerVel.x * 0.14;
      this.deerHead.rotation.y = mouseX * 0.28;

      // Leg articulation
      this.deerLegFL.rotation.x = Math.sin(hopPhase) * 0.55;
      this.deerLegFR.rotation.x = -Math.sin(hopPhase) * 0.55;
      this.deerLegBL.rotation.x = -Math.sin(hopPhase) * 0.55;
      this.deerLegBR.rotation.x = Math.sin(hopPhase) * 0.55;
    }

    // 4. Tiger & Lion Climax Encounter (80% - 100% scroll progress)
    if (scrollProgress >= 0.8) {
      const prog = (scrollProgress - 0.8) / 0.2; // 0.0 to 1.0

      if (prog < 0.35) {
        // Stage 1 & 2: Foreshadowing & Measured Stalking Approach
        const stalkProg = prog / 0.35;
        this.tigerGroup.position.x = -16 + stalkProg * 11;
        this.lionGroup.position.x = 16 - stalkProg * 11;

        // Feline stalk gait
        const stalkPhase = elapsed * 5.0;
        this.tigerLegFL.rotation.x = Math.sin(stalkPhase) * 0.45;
        this.tigerLegFR.rotation.x = -Math.sin(stalkPhase) * 0.45;
        this.tigerLegBL.rotation.x = -Math.sin(stalkPhase) * 0.45;
        this.tigerLegBR.rotation.x = Math.sin(stalkPhase) * 0.45;
        this.tigerTail.rotation.z = Math.sin(stalkPhase * 0.5) * 0.35;

        this.lionLegFL.rotation.x = Math.sin(stalkPhase * 0.9) * 0.4;
        this.lionLegFR.rotation.x = -Math.sin(stalkPhase * 0.9) * 0.4;
        this.lionLegBL.rotation.x = -Math.sin(stalkPhase * 0.9) * 0.4;
        this.lionLegBR.rotation.x = Math.sin(stalkPhase * 0.9) * 0.4;
        this.lionTail.rotation.z = -Math.sin(stalkPhase * 0.5) * 0.35;

        this.clashOpacity = 0;
      } else if (prog >= 0.35 && prog < 0.78) {
        // Stage 3 & 4: Tense Standoff & Controlled Leaping Clash
        const clashIntensity = Math.sin(((prog - 0.35) / 0.43) * Math.PI);
        this.tigerGroup.position.set(-5.0 + clashIntensity * 2.8, -2 + clashIntensity * 2.8, 0);
        this.lionGroup.position.set(5.0 - clashIntensity * 2.8, -2 + clashIntensity * 2.8, 0);

        this.tigerGroup.rotation.z = -clashIntensity * 0.42;
        this.lionGroup.rotation.z = clashIntensity * 0.42;

        this.tigerHead.rotation.x = -clashIntensity * 0.3;
        this.lionHead.rotation.x = -clashIntensity * 0.3;

        this.clashOpacity = clashIntensity * 0.95;
        (this.clashParticles.material as THREE.PointsMaterial).opacity = this.clashOpacity;
      } else {
        // Stage 5: Resolution & Respectful Standoff (Road clears)
        this.tigerGroup.position.set(-9.5, -2, 0);
        this.lionGroup.position.set(9.5, -2, 0);
        this.tigerGroup.rotation.z = 0;
        this.lionGroup.rotation.z = 0;
        this.tigerHead.rotation.x = 0;
        this.lionHead.rotation.x = 0;
        this.clashOpacity = Math.max(0, this.clashOpacity - delta * 2.2);
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
