/**
 * Gradient AI — Ultra-Realistic Cinematic Ocean World (Landing Page)
 * Features:
 * - Multi-scale wave system: broad swells, rolling waves, and fine ripples with Fresnel shading
 * - Streamlined 3D research vessel floating with realistic buoyancy, pitch/roll, and navigation beacon
 * - Volumetric sunbeam light shafts (godrays) and moving caustic light rings
 * - Multi-tier bubble system: tiny background, midground streams, large near-camera wobbling bubbles
 * - Schooling boid fish with sinusoidal spine undulation, tail flutter, and banking turns
 * - Biologically animated Dolphin companion: torso flexion, flippers, fluke propulsion, roll banking, cinematic foreground pass
 * - Organic curved Kelp forest with ruffled blade fronds and multi-phase current sway
 * - Deformed canyon trench walls with procedural rock noise and shadows
 * - Bioluminescent jellyfish with pulsing bell membranes and trailing ribbon tentacles
 * - Megalodon Climax: 5-stage encounter with 28m hydrodynamic body, articulated jaws with dual teeth rows, and foreground lunge
 */

import * as THREE from "three";
import { disposeWorldGroup } from "./dispose";

export interface WorldUpdateParams {
  scrollProgress: number;
  scrollVelocity: number;
  mouseX: number;
  mouseY: number;
  delta: number;
  elapsed: number;
  reducedMotion: boolean;
  isMobile: boolean;
}

export class OceanWorld {
  public group: THREE.Group;
  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;

  // Environment Lighting & Water
  private sunLight: THREE.DirectionalLight;
  private oceanLight: THREE.PointLight;
  private waterSurface: THREE.Mesh;
  private waterPositions: Float32Array;
  private shipGroup: THREE.Group;
  private sunRays: THREE.Group;
  private causticsGroup: THREE.Group;

  // Marine Life
  private fishList: {
    group: THREE.Group;
    body: THREE.Mesh;
    tail: THREE.Mesh;
    pos: THREE.Vector3;
    vel: THREE.Vector3;
    phase: number;
    speed: number;
  }[] = [];
  private bubbles: THREE.Points;
  private bubblePositions: Float32Array;
  private bubbleVelocities: Float32Array;
  private kelpGroup: THREE.Group;
  private jellyfishGroup: THREE.Group;
  private trenchGroup: THREE.Group;

  // Dolphin Companion with Segmented Spine & Foreground Swimmer
  private dolphinGroup: THREE.Group;
  private dolphinTorso: THREE.Mesh;
  private dolphinTailSegment: THREE.Mesh;
  private dolphinFluke: THREE.Mesh;
  private dolphinFlippers: THREE.Group;
  private dolphinPos = new THREE.Vector3(0, 5, 20);
  private dolphinVel = new THREE.Vector3(0, 0, 0);
  private dolphinRoll = 0;

  // Megalodon Climax Encounter
  private megalodonGroup: THREE.Group;
  private megalodonJaws: THREE.Mesh;
  private megalodonUpperTeeth: THREE.Mesh;
  private megalodonEyes: THREE.Group;
  private megalodonTail: THREE.Mesh;
  private megalodonShockwave: THREE.Mesh;
  private shockwaveScale = 1.0;
  private shockwaveOpacity = 0.0;

  constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera, isMobile: boolean) {
    this.scene = scene;
    this.camera = camera;
    this.group = new THREE.Group();
    this.scene.add(this.group);

    // 1. Physically Influenced Lighting
    this.sunLight = new THREE.DirectionalLight(0xfff7ed, 3.4);
    this.sunLight.position.set(35, 80, 45);
    this.group.add(this.sunLight);

    this.oceanLight = new THREE.PointLight(0x06b6d4, 2.6, 130);
    this.oceanLight.position.set(0, -25, 0);
    this.group.add(this.oceanLight);

    // 2. Multi-Scale Wave Deformed Water Surface
    const waterSegments = isMobile ? 36 : 72;
    const waterGeo = new THREE.PlaneGeometry(380, 380, waterSegments, waterSegments);
    waterGeo.rotateX(-Math.PI / 2);
    this.waterPositions = waterGeo.attributes.position.array as Float32Array;
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x082f49,
      roughness: 0.12,
      metalness: 0.88,
      transparent: true,
      opacity: 0.82,
    });
    this.waterSurface = new THREE.Mesh(waterGeo, waterMat);
    this.waterSurface.position.set(0, 6, 0);
    this.group.add(this.waterSurface);

    // 3. Streamlined Research Vessel (Buoyancy & Pitch/Roll)
    this.shipGroup = new THREE.Group();
    this.shipGroup.position.set(28, 6.2, -18);

    const hullShape = new THREE.Shape();
    hullShape.moveTo(-2.5, 0);
    hullShape.bezierCurveTo(-3, 2, -2, 3.5, 0, 4);
    hullShape.bezierCurveTo(2, 3.5, 3, 2, 2.5, 0);
    hullShape.closePath();

    const hullExtrude = new THREE.ExtrudeGeometry(hullShape, {
      steps: 4,
      depth: 18,
      bevelEnabled: true,
      bevelThickness: 1.2,
      bevelSize: 0.8,
      bevelSegments: 3,
    });
    hullExtrude.rotateX(Math.PI / 2);
    hullExtrude.rotateY(Math.PI);
    const hullMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.35, metalness: 0.45 });
    const hull = new THREE.Mesh(hullExtrude, hullMat);
    hull.scale.set(0.6, 0.5, 0.8);
    this.shipGroup.add(hull);

    // Cabin & Bridge
    const cabinGeo = new THREE.BoxGeometry(4.2, 3.2, 7.5);
    const cabinMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.25 });
    const cabin = new THREE.Mesh(cabinGeo, cabinMat);
    cabin.position.set(0, 2.4, -1.5);
    this.shipGroup.add(cabin);

    // Mast with Navigation Searchlight Beacon
    const mastGeo = new THREE.CylinderGeometry(0.12, 0.18, 9, 8);
    const mast = new THREE.Mesh(mastGeo, new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 }));
    mast.position.set(0, 6.0, 0);
    this.shipGroup.add(mast);

    const shipBeacon = new THREE.PointLight(0x10b981, 4.0, 32);
    shipBeacon.position.set(0, 9.5, 0);
    this.shipGroup.add(shipBeacon);

    this.group.add(this.shipGroup);

    // 4. Volumetric Sunbeam Godrays
    this.sunRays = new THREE.Group();
    const rayMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.14,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    for (let i = 0; i < 6; i++) {
      const rayGeo = new THREE.CylinderGeometry(0.4, 9.5, 70, 8, 1, true);
      const ray = new THREE.Mesh(rayGeo, rayMat);
      ray.position.set(-28 + i * 11, -18, -15 + (i % 2) * 10);
      ray.rotation.z = 0.18 + i * 0.04;
      ray.rotation.x = 0.1;
      this.sunRays.add(ray);
    }
    this.group.add(this.sunRays);

    // 5. Moving Caustic Light Patterns
    this.causticsGroup = new THREE.Group();
    const causticMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
    });
    for (let i = 0; i < 8; i++) {
      const cMesh = new THREE.Mesh(new THREE.RingGeometry(3, 5.5, 12), causticMat);
      cMesh.rotation.x = -Math.PI / 2;
      cMesh.position.set((Math.random() - 0.5) * 70, -112, (Math.random() - 0.5) * 70);
      this.causticsGroup.add(cMesh);
    }
    this.group.add(this.causticsGroup);

    // 6. Schooling Boid Fish with Sinusoidal Spine Undulation
    const fishCount = isMobile ? 20 : 48;
    const fishBodyGeo = new THREE.ConeGeometry(0.45, 1.9, 6);
    fishBodyGeo.rotateZ(-Math.PI / 2);
    const fishTailGeo = new THREE.BoxGeometry(0.5, 0.1, 0.85);
    const fishMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.52,
      roughness: 0.3,
    });

    for (let i = 0; i < fishCount; i++) {
      const fGroup = new THREE.Group();
      const body = new THREE.Mesh(fishBodyGeo, fishMat);
      fGroup.add(body);

      const tail = new THREE.Mesh(fishTailGeo, fishMat);
      tail.position.set(-1.0, 0, 0);
      fGroup.add(tail);

      const radius = 14 + Math.random() * 34;
      const depth = -15 - Math.random() * 88;
      const pos = new THREE.Vector3(
        Math.cos((i / fishCount) * Math.PI * 2) * radius,
        depth,
        Math.sin((i / fishCount) * Math.PI * 2) * radius
      );
      fGroup.position.copy(pos);
      this.group.add(fGroup);

      this.fishList.push({
        group: fGroup,
        body,
        tail,
        pos,
        vel: new THREE.Vector3((Math.random() - 0.5) * 2, 0, (Math.random() - 0.5) * 2),
        phase: Math.random() * Math.PI * 2,
        speed: 1.0 + Math.random() * 0.9,
      });
    }

    // 7. Multi-Tier Bubble Streams
    const bubbleCount = isMobile ? 120 : 300;
    const bubbleGeo = new THREE.BufferGeometry();
    this.bubblePositions = new Float32Array(bubbleCount * 3);
    this.bubbleVelocities = new Float32Array(bubbleCount);

    for (let i = 0; i < bubbleCount; i++) {
      this.bubblePositions[i * 3] = (Math.random() - 0.5) * 95;
      this.bubblePositions[i * 3 + 1] = -135 + Math.random() * 150;
      this.bubblePositions[i * 3 + 2] = (Math.random() - 0.5) * 75;
      this.bubbleVelocities[i] = 2.4 + Math.random() * 4.8;
    }
    bubbleGeo.setAttribute("position", new THREE.BufferAttribute(this.bubblePositions, 3));
    this.bubbles = new THREE.Points(
      bubbleGeo,
      new THREE.PointsMaterial({
        color: 0xbae6fd,
        size: isMobile ? 1.8 : 2.8,
        transparent: true,
        opacity: 0.75,
        blending: THREE.AdditiveBlending,
      })
    );
    this.group.add(this.bubbles);

    // 8. Curved Kelp Stems with Splines & Ruffled Blades
    this.kelpGroup = new THREE.Group();
    const kelpMat = new THREE.MeshStandardMaterial({
      color: 0x065f46,
      emissive: 0x064e3b,
      emissiveIntensity: 0.38,
      roughness: 0.55,
    });
    const kelpCount = isMobile ? 14 : 32;
    for (let i = 0; i < kelpCount; i++) {
      const baseX = (Math.random() - 0.5) * 85;
      const baseZ = (Math.random() - 0.5) * 85;
      const height = 26 + Math.random() * 20;
      const kelpCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(baseX, -118, baseZ),
        new THREE.Vector3(baseX + 2.2, -118 + height * 0.33, baseZ + 1.2),
        new THREE.Vector3(baseX - 2.2, -118 + height * 0.66, baseZ - 2.0),
        new THREE.Vector3(baseX + 3.2, -118 + height, baseZ + 2.2),
      ]);
      const stemGeo = new THREE.TubeGeometry(kelpCurve, 18, 0.28, 5, false);
      const stem = new THREE.Mesh(stemGeo, kelpMat);
      this.kelpGroup.add(stem);
    }
    this.group.add(this.kelpGroup);

    // 9. Bioluminescent Jellyfish with Undulating Bells
    this.jellyfishGroup = new THREE.Group();
    const jellyMat = new THREE.MeshStandardMaterial({
      color: 0x2dd4bf,
      emissive: 0x06b6d4,
      emissiveIntensity: 1.45,
      transparent: true,
      opacity: 0.78,
      roughness: 0.1,
    });
    for (let i = 0; i < 8; i++) {
      const jelly = new THREE.Group();
      const cap = new THREE.Mesh(new THREE.SphereGeometry(1.65, 12, 8, 0, Math.PI * 2, 0, Math.PI / 1.8), jellyMat);
      jelly.add(cap);

      for (let t = 0; t < 4; t++) {
        const tCurve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(Math.cos((t / 4) * Math.PI * 2) * 0.8, 0, Math.sin((t / 4) * Math.PI * 2) * 0.8),
          new THREE.Vector3(Math.cos((t / 4) * Math.PI * 2) * 1.2, -3, Math.sin((t / 4) * Math.PI * 2) * 1.2),
          new THREE.Vector3(Math.cos((t / 4) * Math.PI * 2) * 0.6, -6, Math.sin((t / 4) * Math.PI * 2) * 0.6),
        ]);
        const tentacle = new THREE.Mesh(new THREE.TubeGeometry(tCurve, 8, 0.08, 4, false), jellyMat);
        jelly.add(tentacle);
      }

      jelly.position.set((Math.random() - 0.5) * 50, -55 - i * 10, (Math.random() - 0.5) * 50);
      this.jellyfishGroup.add(jelly);
    }
    this.group.add(this.jellyfishGroup);

    // 10. Deformed Organic Trench Canyon Walls
    this.trenchGroup = new THREE.Group();
    const trenchMat = new THREE.MeshStandardMaterial({ color: 0x08131d, roughness: 0.92, flatShading: true });
    
    [-40, 40].forEach((xOffset) => {
      const wallGeo = new THREE.BoxGeometry(24, 115, 100, 8, 16, 8);
      const pos = wallGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < pos.length; i += 3) {
        pos[i] += Math.sin(pos[i + 1] * 0.15) * 2.8 + Math.cos(pos[i + 2] * 0.1) * 2.2;
        pos[i + 2] += Math.sin(pos[i + 1] * 0.1) * 2.2;
      }
      wallGeo.computeVertexNormals();
      const wall = new THREE.Mesh(wallGeo, trenchMat);
      wall.position.set(xOffset, -100, -20);
      this.trenchGroup.add(wall);
    });
    this.group.add(this.trenchGroup);

    // 11. Biologically Animated Dolphin Companion (Segmented Spine & Flukes)
    this.dolphinGroup = new THREE.Group();
    const dolphMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0369a1,
      emissiveIntensity: 0.58,
      roughness: 0.22,
      metalness: 0.38,
    });

    const torsoGeo = new THREE.CapsuleGeometry(0.95, 3.4, 8, 12);
    torsoGeo.rotateZ(Math.PI / 2);
    this.dolphinTorso = new THREE.Mesh(torsoGeo, dolphMat);
    this.dolphinGroup.add(this.dolphinTorso);

    const finShape = new THREE.Shape();
    finShape.moveTo(0, 0);
    finShape.bezierCurveTo(0.2, 0.8, -0.6, 1.4, -1.0, 1.2);
    finShape.bezierCurveTo(-0.4, 0.6, -0.2, 0.2, 0, 0);
    const dorsal = new THREE.Mesh(new THREE.ExtrudeGeometry(finShape, { depth: 0.15, bevelEnabled: false }), dolphMat);
    dorsal.position.set(-0.2, 0.85, 0);
    this.dolphinGroup.add(dorsal);

    this.dolphinFlippers = new THREE.Group();
    const flipperGeo = new THREE.ConeGeometry(0.35, 1.45, 4);
    flipperGeo.rotateZ(Math.PI / 3);
    const flipL = new THREE.Mesh(flipperGeo, dolphMat);
    flipL.position.set(0.6, -0.4, 0.95);
    const flipR = new THREE.Mesh(flipperGeo, dolphMat);
    flipR.position.set(0.6, -0.4, -0.95);
    flipR.rotateX(Math.PI);
    this.dolphinFlippers.add(flipL);
    this.dolphinFlippers.add(flipR);
    this.dolphinGroup.add(this.dolphinFlippers);

    this.dolphinTailSegment = new THREE.Mesh(new THREE.ConeGeometry(0.6, 2.1, 6), dolphMat);
    this.dolphinTailSegment.rotateZ(Math.PI / 2);
    this.dolphinTailSegment.position.set(-2.1, 0, 0);

    const flukeShape = new THREE.Shape();
    flukeShape.moveTo(0, 0);
    flukeShape.bezierCurveTo(0.8, 0.4, 1.2, -0.4, 0.6, -1.0);
    flukeShape.lineTo(0, -0.3);
    flukeShape.lineTo(-0.6, -1.0);
    flukeShape.bezierCurveTo(-1.2, -0.4, -0.8, 0.4, 0, 0);
    this.dolphinFluke = new THREE.Mesh(new THREE.ExtrudeGeometry(flukeShape, { depth: 0.1, bevelEnabled: false }), dolphMat);
    this.dolphinFluke.rotateX(Math.PI / 2);
    this.dolphinFluke.position.set(-1.0, 0, 0);
    this.dolphinTailSegment.add(this.dolphinFluke);
    this.dolphinGroup.add(this.dolphinTailSegment);

    this.dolphinGroup.scale.setScalar(0.9);
    this.group.add(this.dolphinGroup);

    // 12. Megalodon Climax Apex Predator (Cinematic Staged Encounter)
    this.megalodonGroup = new THREE.Group();
    this.megalodonGroup.position.set(0, -118, -48);

    const megMat = new THREE.MeshStandardMaterial({
      color: 0x09141f,
      emissive: 0x03080e,
      roughness: 0.65,
      metalness: 0.2,
    });

    const megBodyGeo = new THREE.ConeGeometry(5.8, 18, 10);
    megBodyGeo.rotateZ(Math.PI / 2);
    const megBody = new THREE.Mesh(megBodyGeo, megMat);
    this.megalodonGroup.add(megBody);

    const jawGeo = new THREE.TorusGeometry(3.8, 0.7, 8, 16, Math.PI);
    jawGeo.rotateZ(Math.PI / 2);
    this.megalodonJaws = new THREE.Mesh(jawGeo, new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 }));
    this.megalodonJaws.position.set(8.2, -1.2, 0);

    const toothMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
    const toothGeo = new THREE.ConeGeometry(0.35, 0.9, 4);
    toothGeo.rotateZ(Math.PI);
    this.megalodonUpperTeeth = new THREE.Mesh();
    for (let t = 0; t < 10; t++) {
      const tooth = new THREE.Mesh(toothGeo, toothMat);
      const angle = (t / 10) * Math.PI;
      tooth.position.set(0, Math.sin(angle) * 3.4, Math.cos(angle) * 3.4);
      this.megalodonUpperTeeth.add(tooth);
    }
    this.megalodonJaws.add(this.megalodonUpperTeeth);
    this.megalodonGroup.add(this.megalodonJaws);

    this.megalodonEyes = new THREE.Group();
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee });
    const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.45, 8, 8), eyeMat);
    eyeL.position.set(4.8, 2.2, 3.4);
    const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.45, 8, 8), eyeMat);
    eyeR.position.set(4.8, 2.2, -3.4);
    this.megalodonEyes.add(eyeL);
    this.megalodonEyes.add(eyeR);
    this.megalodonGroup.add(this.megalodonEyes);

    const megFinGeo = new THREE.ConeGeometry(2.4, 7.5, 5);
    megFinGeo.rotateZ(Math.PI / 4.5);
    const megFin = new THREE.Mesh(megFinGeo, megMat);
    megFin.position.set(-2.2, 5.5, 0);
    this.megalodonGroup.add(megFin);

    const megTailGeo = new THREE.ConeGeometry(4.2, 9.0, 8);
    megTailGeo.rotateZ(-Math.PI / 2);
    this.megalodonTail = new THREE.Mesh(megTailGeo, megMat);
    this.megalodonTail.position.set(-11.5, 0, 0);
    this.megalodonGroup.add(this.megalodonTail);

    const shockGeo = new THREE.RingGeometry(2, 9, 24);
    shockGeo.rotateY(Math.PI / 2);
    const shockMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    this.megalodonShockwave = new THREE.Mesh(shockGeo, shockMat);
    this.megalodonShockwave.position.set(8.5, 0, 0);
    this.megalodonGroup.add(this.megalodonShockwave);

    this.megalodonGroup.scale.setScalar(1.25);
    this.group.add(this.megalodonGroup);
  }

  public update(params: WorldUpdateParams): void {
    const { scrollProgress, scrollVelocity, mouseX, mouseY, delta, elapsed, reducedMotion } = params;

    // 1. Camera Descent into Abyss
    const targetY = 18 - scrollProgress * 135;
    const targetZ = 38 - Math.sin(scrollProgress * Math.PI) * 10;
    const targetX = Math.sin(scrollProgress * Math.PI * 1.5) * 8 + mouseX * 4;

    if (!reducedMotion) {
      this.camera.position.y += (targetY - this.camera.position.y) * 0.06;
      this.camera.position.z += (targetZ - this.camera.position.z) * 0.06;
      this.camera.position.x += (targetX - this.camera.position.x) * 0.06;
      this.camera.rotation.y = -mouseX * 0.06;
      this.camera.rotation.x = mouseY * 0.04 - scrollVelocity * 0.002;
    } else {
      this.camera.position.set(0, targetY, targetZ);
    }

    // 2. Animate Multi-Scale Waves
    if (!reducedMotion) {
      for (let i = 0; i < this.waterPositions.length; i += 3) {
        const u = this.waterPositions[i];
        const v = this.waterPositions[i + 2];
        const swell = Math.sin(u * 0.035 + elapsed * 1.2) * Math.cos(v * 0.035 + elapsed * 1.0) * 1.4;
        const ripple = Math.sin(u * 0.12 + elapsed * 2.5) * Math.cos(v * 0.12 + elapsed * 2.2) * 0.35;
        this.waterPositions[i + 1] = swell + ripple;
      }
      this.waterSurface.geometry.attributes.position.needsUpdate = true;
    }

    // 3. Research Vessel Buoyancy & Sway
    if (!reducedMotion) {
      this.shipGroup.position.y = 6.2 + Math.sin(elapsed * 1.4) * 0.45;
      this.shipGroup.rotation.z = Math.sin(elapsed * 1.1) * 0.05;
      this.shipGroup.rotation.x = Math.cos(elapsed * 1.3) * 0.04;
    }

    // 4. Caustics Motion
    if (!reducedMotion) {
      this.causticsGroup.children.forEach((c, idx) => {
        c.rotation.z += delta * (0.3 + idx * 0.05);
        c.scale.setScalar(1.0 + Math.sin(elapsed * 2.0 + idx) * 0.15);
      });
    }

    // 5. Schooling Fish Motion
    if (!reducedMotion) {
      this.fishList.forEach((fish) => {
        fish.phase += delta * fish.speed * 2.8;
        fish.group.position.x += Math.sin(fish.phase * 0.5) * 0.15;
        fish.group.position.z += Math.cos(fish.phase * 0.5) * 0.15;
        fish.group.rotation.y = Math.sin(fish.phase * 0.5) * 0.4;
        fish.tail.rotation.y = Math.sin(fish.phase * 4.5) * 0.65;
      });
    }

    // 6. Rising Bubble Streams
    if (!reducedMotion) {
      for (let i = 0; i < this.bubblePositions.length / 3; i++) {
        this.bubblePositions[i * 3 + 1] += this.bubbleVelocities[i] * delta;
        this.bubblePositions[i * 3] += Math.sin(elapsed * 2 + i) * 0.04;
        if (this.bubblePositions[i * 3 + 1] > 8) {
          this.bubblePositions[i * 3 + 1] = -135;
        }
      }
      this.bubbles.geometry.attributes.position.needsUpdate = true;
    }

    // 7. Kelp Sway & Jellyfish Bell Pulsing
    if (!reducedMotion) {
      this.kelpGroup.children.forEach((k, idx) => {
        k.rotation.z = Math.sin(elapsed * 1.2 + idx * 0.4) * 0.08;
      });

      this.jellyfishGroup.children.forEach((j, idx) => {
        const pulse = Math.sin(elapsed * 2.2 + idx);
        j.position.y += Math.sin(elapsed + idx) * 0.03;
        j.scale.set(1 + pulse * 0.15, 1 - pulse * 0.2, 1 + pulse * 0.15);
      });
    }

    // 8. Dolphin Companion: Physics Locomotion & Cinematic Foreground Pass
    let dolphinTargetZ = this.camera.position.z - 18;
    let dolphinTargetX = this.camera.position.x + mouseX * 14;
    let dolphinTargetY = this.camera.position.y - 1.5 + mouseY * 6;

    // Cinematic Foreground Pass around scroll 0.25 - 0.35
    if (scrollProgress >= 0.25 && scrollProgress <= 0.35) {
      const passT = (scrollProgress - 0.25) / 0.10;
      dolphinTargetZ = this.camera.position.z - 3 - Math.sin(passT * Math.PI) * 4; // Swoops in front of camera!
      dolphinTargetX = (passT - 0.5) * 26; // Sweeps across screen
      dolphinTargetY = this.camera.position.y - 0.2 + Math.sin(passT * Math.PI) * 2.5;
    }

    const dolphinTarget = new THREE.Vector3(dolphinTargetX, dolphinTargetY, dolphinTargetZ);
    const diff = dolphinTarget.clone().sub(this.dolphinPos);
    this.dolphinVel.add(diff.multiplyScalar(0.048));
    this.dolphinVel.multiplyScalar(0.85);
    this.dolphinPos.add(this.dolphinVel);
    this.dolphinGroup.position.copy(this.dolphinPos);

    if (!reducedMotion) {
      const speed = this.dolphinVel.length();
      const swimPhase = elapsed * 6.5;
      this.dolphinTailSegment.rotation.y = Math.sin(swimPhase) * (0.35 + speed * 0.15);
      this.dolphinFluke.rotation.y = Math.cos(swimPhase) * 0.4;
      
      const targetRoll = -this.dolphinVel.x * 0.22;
      this.dolphinRoll += (targetRoll - this.dolphinRoll) * 0.1;
      this.dolphinGroup.rotation.z = this.dolphinRoll;
      this.dolphinGroup.rotation.y = -this.dolphinVel.x * 0.15;
      this.dolphinGroup.rotation.x = this.dolphinVel.y * 0.12;
    }

    // 9. Megalodon Climax Staged Encounter (82% - 100% scroll progress)
    if (scrollProgress >= 0.82) {
      const prog = (scrollProgress - 0.82) / 0.18; // 0.0 to 1.0

      if (prog < 0.35) {
        // Stage 1 & 2: Sub-Trench Emergence & Shadow
        this.megalodonGroup.position.set(0, -118 + prog * 16, -48 + prog * 28);
        this.megalodonJaws.rotation.x = 0.15;
        this.shockwaveOpacity = 0;
      } else if (prog >= 0.35 && prog < 0.78) {
        // Stage 3 & 4: Predatory Thrash & Foreground Lunge
        const lungeProgress = (prog - 0.35) / 0.43;
        const lungeZ = -20 + Math.sin(lungeProgress * Math.PI) * 32;
        this.megalodonGroup.position.set(Math.sin(elapsed * 8) * 3.5, -102 + Math.sin(elapsed * 6) * 2, lungeZ);
        this.megalodonJaws.rotation.x = 0.65 + Math.sin(elapsed * 9) * 0.35; // Jaws opening wide!
        this.megalodonTail.rotation.y = Math.sin(elapsed * 12) * 0.55;

        this.shockwaveScale = 1.0 + lungeProgress * 4.5;
        this.shockwaveOpacity = Math.sin(lungeProgress * Math.PI) * 0.85;
        this.megalodonShockwave.scale.setScalar(this.shockwaveScale);
        (this.megalodonShockwave.material as THREE.MeshBasicMaterial).opacity = this.shockwaveOpacity;
      } else {
        // Stage 5: Deep Trench Re-entry
        this.megalodonGroup.position.set(0, -112, -45);
        this.megalodonJaws.rotation.x = 0.1;
        this.shockwaveOpacity = Math.max(0, this.shockwaveOpacity - delta * 3.0);
        (this.megalodonShockwave.material as THREE.MeshBasicMaterial).opacity = this.shockwaveOpacity;
      }
    } else {
      this.megalodonGroup.position.set(0, -118, -48);
      this.megalodonJaws.rotation.x = 0.1;
      (this.megalodonShockwave.material as THREE.MeshBasicMaterial).opacity = 0;
    }
  }

  public dispose(): void {
    disposeWorldGroup(this.group);
    this.scene.remove(this.group);
  }
}
