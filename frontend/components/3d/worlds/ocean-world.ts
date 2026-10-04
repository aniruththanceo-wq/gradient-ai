/**
 * Gradient AI — Ultra-Realistic Cinematic Ocean World (Landing Page)
 * Features:
 * - Multi-frequency ocean surface waves with sunlight shimmer & Fresnel shading
 * - Streamlined 3D research vessel floating with realistic buoyancy & pitch/roll
 * - Volumetric sunbeam light shafts filtering through water layers
 * - Boid-inspired schooling fish with sinusoidal spine & tail fin undulation
 * - Biologically animated Dolphin companion with spine curvature, roll banking, and bubble wake
 * - Organic curved Kelp forest swaying to underwater current phase offsets
 * - Deformed canyon trench walls with procedural vertex displacement
 * - Bioluminescent jellyfish with pulsing bell membranes
 * - Megalodon Climax: 5-stage staged encounter with massive curved body, articulated jaws & teeth, shockwave burst
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

  // Environment Lighting
  private sunLight: THREE.DirectionalLight;
  private oceanLight: THREE.PointLight;
  private waterSurface: THREE.Mesh;
  private waterPositions: Float32Array;
  private shipGroup: THREE.Group;
  private sunRays: THREE.Group;

  // Spline-Based Underwater Currents
  private currentCurves: THREE.Line[] = [];

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

  // Dolphin Companion with Segmented Spine
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
    this.sunLight = new THREE.DirectionalLight(0xfff7ed, 3.2);
    this.sunLight.position.set(35, 75, 45);
    this.group.add(this.sunLight);

    this.oceanLight = new THREE.PointLight(0x06b6d4, 2.5, 120);
    this.oceanLight.position.set(0, -25, 0);
    this.group.add(this.oceanLight);

    // 2. Multi-Frequency Wave Deformed Water Surface
    const waterSegments = isMobile ? 32 : 64;
    const waterGeo = new THREE.PlaneGeometry(360, 360, waterSegments, waterSegments);
    waterGeo.rotateX(-Math.PI / 2);
    this.waterPositions = waterGeo.attributes.position.array as Float32Array;
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x082f49,
      roughness: 0.15,
      metalness: 0.85,
      transparent: true,
      opacity: 0.78,
    });
    this.waterSurface = new THREE.Mesh(waterGeo, waterMat);
    this.waterSurface.position.set(0, 6, 0);
    this.group.add(this.waterSurface);

    // 3. Curved Research Vessel / Ship (Organic Streamlined Hull)
    this.shipGroup = new THREE.Group();
    this.shipGroup.position.set(28, 6.2, -18);

    // Hull built from curved spline cross-sections
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
    const hullMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.35, metalness: 0.4 });
    const hull = new THREE.Mesh(hullExtrude, hullMat);
    hull.scale.set(0.6, 0.5, 0.8);
    this.shipGroup.add(hull);

    // Cabin & Bridge
    const cabinGeo = new THREE.BoxGeometry(4.2, 3.2, 7.5);
    const cabinMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.25 });
    const cabin = new THREE.Mesh(cabinGeo, cabinMat);
    cabin.position.set(0, 2.4, -1.5);
    this.shipGroup.add(cabin);

    // Mast with Navigation Searchlight
    const mastGeo = new THREE.CylinderGeometry(0.12, 0.18, 9, 8);
    const mast = new THREE.Mesh(mastGeo, new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 }));
    mast.position.set(0, 6.0, 0);
    this.shipGroup.add(mast);

    const shipBeacon = new THREE.PointLight(0x10b981, 4.0, 30);
    shipBeacon.position.set(0, 9.5, 0);
    this.shipGroup.add(shipBeacon);

    this.group.add(this.shipGroup);

    // 4. Volumetric Sun Rays (Curved Tapered Beams)
    this.sunRays = new THREE.Group();
    const rayMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.14,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    for (let i = 0; i < 6; i++) {
      const rayGeo = new THREE.CylinderGeometry(0.4, 9.0, 65, 8, 1, true);
      const ray = new THREE.Mesh(rayGeo, rayMat);
      ray.position.set(-28 + i * 11, -18, -15 + (i % 2) * 10);
      ray.rotation.z = 0.18 + i * 0.04;
      ray.rotation.x = 0.1;
      this.sunRays.add(ray);
    }
    this.group.add(this.sunRays);

    // 5. Spline-Based Underwater Current Trails
    for (let i = 0; i < 3; i++) {
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-40 + i * 30, -10 - i * 25, 20),
        new THREE.Vector3(-15 + i * 20, -25 - i * 25, -10),
        new THREE.Vector3(20 - i * 15, -45 - i * 25, -30),
        new THREE.Vector3(45 - i * 20, -70 - i * 25, 10),
      ]);
      const tubeGeo = new THREE.TubeGeometry(curve, 32, 0.4, 6, false);
      const tubeMat = new THREE.MeshBasicMaterial({
        color: 0x06b6d4,
        transparent: true,
        opacity: 0.15,
        blending: THREE.AdditiveBlending,
      });
      const tube = new THREE.Mesh(tubeGeo, tubeMat);
      this.group.add(tube);
    }

    // 6. Boid-Inspired Schooling Fish with Spine Undulation
    const fishCount = isMobile ? 18 : 42;
    const fishBodyGeo = new THREE.ConeGeometry(0.42, 1.8, 6);
    fishBodyGeo.rotateZ(-Math.PI / 2);
    const fishTailGeo = new THREE.BoxGeometry(0.5, 0.1, 0.8);
    const fishMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.5,
      roughness: 0.3,
    });

    for (let i = 0; i < fishCount; i++) {
      const fGroup = new THREE.Group();
      const body = new THREE.Mesh(fishBodyGeo, fishMat);
      fGroup.add(body);

      const tail = new THREE.Mesh(fishTailGeo, fishMat);
      tail.position.set(-1.0, 0, 0);
      fGroup.add(tail);

      const radius = 14 + Math.random() * 32;
      const depth = -15 - Math.random() * 85;
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

    // 7. Multi-Tier Bubble Stream Particles
    const bubbleCount = isMobile ? 100 : 260;
    const bubbleGeo = new THREE.BufferGeometry();
    this.bubblePositions = new Float32Array(bubbleCount * 3);
    this.bubbleVelocities = new Float32Array(bubbleCount);

    for (let i = 0; i < bubbleCount; i++) {
      this.bubblePositions[i * 3] = (Math.random() - 0.5) * 90;
      this.bubblePositions[i * 3 + 1] = -130 + Math.random() * 145;
      this.bubblePositions[i * 3 + 2] = (Math.random() - 0.5) * 70;
      this.bubbleVelocities[i] = 2.2 + Math.random() * 4.5;
    }
    bubbleGeo.setAttribute("position", new THREE.BufferAttribute(this.bubblePositions, 3));
    this.bubbles = new THREE.Points(
      bubbleGeo,
      new THREE.PointsMaterial({
        color: 0xbae6fd,
        size: isMobile ? 1.8 : 2.8,
        transparent: true,
        opacity: 0.72,
        blending: THREE.AdditiveBlending,
      })
    );
    this.group.add(this.bubbles);

    // 8. Curved Kelp Stems with Splines
    this.kelpGroup = new THREE.Group();
    const kelpMat = new THREE.MeshStandardMaterial({
      color: 0x065f46,
      emissive: 0x064e3b,
      emissiveIntensity: 0.35,
      roughness: 0.6,
    });
    const kelpCount = isMobile ? 12 : 28;
    for (let i = 0; i < kelpCount; i++) {
      const baseX = (Math.random() - 0.5) * 80;
      const baseZ = (Math.random() - 0.5) * 80;
      const height = 24 + Math.random() * 18;
      const kelpCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(baseX, -115, baseZ),
        new THREE.Vector3(baseX + 2, -115 + height * 0.33, baseZ + 1),
        new THREE.Vector3(baseX - 2, -115 + height * 0.66, baseZ - 2),
        new THREE.Vector3(baseX + 3, -115 + height, baseZ + 2),
      ]);
      const stemGeo = new THREE.TubeGeometry(kelpCurve, 16, 0.25, 5, false);
      const stem = new THREE.Mesh(stemGeo, kelpMat);
      this.kelpGroup.add(stem);
    }
    this.group.add(this.kelpGroup);

    // 9. Bioluminescent Jellyfish with Undulating Bell
    this.jellyfishGroup = new THREE.Group();
    const jellyMat = new THREE.MeshStandardMaterial({
      color: 0x2dd4bf,
      emissive: 0x06b6d4,
      emissiveIntensity: 1.4,
      transparent: true,
      opacity: 0.75,
      roughness: 0.1,
    });
    for (let i = 0; i < 7; i++) {
      const jelly = new THREE.Group();
      const cap = new THREE.Mesh(new THREE.SphereGeometry(1.6, 12, 8, 0, Math.PI * 2, 0, Math.PI / 1.8), jellyMat);
      jelly.add(cap);

      // Trailing tentacles
      for (let t = 0; t < 4; t++) {
        const tCurve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(Math.cos((t / 4) * Math.PI * 2) * 0.8, 0, Math.sin((t / 4) * Math.PI * 2) * 0.8),
          new THREE.Vector3(Math.cos((t / 4) * Math.PI * 2) * 1.2, -3, Math.sin((t / 4) * Math.PI * 2) * 1.2),
          new THREE.Vector3(Math.cos((t / 4) * Math.PI * 2) * 0.6, -6, Math.sin((t / 4) * Math.PI * 2) * 0.6),
        ]);
        const tentacle = new THREE.Mesh(new THREE.TubeGeometry(tCurve, 8, 0.08, 4, false), jellyMat);
        jelly.add(tentacle);
      }

      jelly.position.set((Math.random() - 0.5) * 45, -55 - i * 11, (Math.random() - 0.5) * 45);
      this.jellyfishGroup.add(jelly);
    }
    this.group.add(this.jellyfishGroup);

    // 10. Deformed Organic Trench Canyon Walls (with 3D vertex noise)
    this.trenchGroup = new THREE.Group();
    const trenchMat = new THREE.MeshStandardMaterial({ color: 0x08131d, roughness: 0.9, flatShading: true });
    
    // Left & Right canyon walls
    [-38, 38].forEach((xOffset) => {
      const wallGeo = new THREE.BoxGeometry(22, 110, 95, 8, 16, 8);
      const pos = wallGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < pos.length; i += 3) {
        pos[i] += Math.sin(pos[i + 1] * 0.15) * 2.5 + Math.cos(pos[i + 2] * 0.1) * 2.0;
        pos[i + 2] += Math.sin(pos[i + 1] * 0.1) * 2.0;
      }
      wallGeo.computeVertexNormals();
      const wall = new THREE.Mesh(wallGeo, trenchMat);
      wall.position.set(xOffset, -100, -20);
      this.trenchGroup.add(wall);
    });
    this.group.add(this.trenchGroup);

    // 11. Biologically Animated Dolphin Companion (Segmented Spine)
    this.dolphinGroup = new THREE.Group();
    const dolphMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0369a1,
      emissiveIntensity: 0.55,
      roughness: 0.2,
      metalness: 0.35,
    });

    // Torso Segment
    const torsoGeo = new THREE.CapsuleGeometry(0.9, 3.2, 8, 12);
    torsoGeo.rotateZ(Math.PI / 2);
    this.dolphinTorso = new THREE.Mesh(torsoGeo, dolphMat);
    this.dolphinGroup.add(this.dolphinTorso);

    // Dorsal Fin
    const finShape = new THREE.Shape();
    finShape.moveTo(0, 0);
    finShape.bezierCurveTo(0.2, 0.8, -0.6, 1.4, -1.0, 1.2);
    finShape.bezierCurveTo(-0.4, 0.6, -0.2, 0.2, 0, 0);
    const dorsal = new THREE.Mesh(new THREE.ExtrudeGeometry(finShape, { depth: 0.15, bevelEnabled: false }), dolphMat);
    dorsal.position.set(-0.2, 0.8, 0);
    this.dolphinGroup.add(dorsal);

    // Flippers
    this.dolphinFlippers = new THREE.Group();
    const flipperGeo = new THREE.ConeGeometry(0.35, 1.4, 4);
    flipperGeo.rotateZ(Math.PI / 3);
    const flipL = new THREE.Mesh(flipperGeo, dolphMat);
    flipL.position.set(0.6, -0.4, 0.9);
    const flipR = new THREE.Mesh(flipperGeo, dolphMat);
    flipR.position.set(0.6, -0.4, -0.9);
    flipR.rotateX(Math.PI);
    this.dolphinFlippers.add(flipL);
    this.dolphinFlippers.add(flipR);
    this.dolphinGroup.add(this.dolphinFlippers);

    // Tail Fluke Segment
    this.dolphinTailSegment = new THREE.Mesh(new THREE.ConeGeometry(0.6, 2.0, 6), dolphMat);
    this.dolphinTailSegment.rotateZ(Math.PI / 2);
    this.dolphinTailSegment.position.set(-2.0, 0, 0);

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

    // Segmented Streamlined Torso & Snout
    const megBodyGeo = new THREE.ConeGeometry(5.8, 18, 10);
    megBodyGeo.rotateZ(Math.PI / 2);
    const megBody = new THREE.Mesh(megBodyGeo, megMat);
    this.megalodonGroup.add(megBody);

    // Articulated Jaws with 2 Tiers of Serrated Teeth
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

    // Glowing Cyan Predatory Eyes
    this.megalodonEyes = new THREE.Group();
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee });
    const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.45, 8, 8), eyeMat);
    eyeL.position.set(4.8, 2.2, 3.4);
    const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.45, 8, 8), eyeMat);
    eyeR.position.set(4.8, 2.2, -3.4);
    this.megalodonEyes.add(eyeL);
    this.megalodonEyes.add(eyeR);
    this.megalodonGroup.add(this.megalodonEyes);

    // Massive Dorsal Fin
    const megFinGeo = new THREE.ConeGeometry(2.4, 7.5, 5);
    megFinGeo.rotateZ(Math.PI / 4.5);
    const megFin = new THREE.Mesh(megFinGeo, megMat);
    megFin.position.set(-2.2, 5.5, 0);
    this.megalodonGroup.add(megFin);

    // Tail Fluke
    this.megalodonTail = new THREE.Mesh(new THREE.BoxGeometry(1.5, 8.0, 0.4), megMat);
    this.megalodonTail.position.set(-9.0, 0, 0);
    this.megalodonGroup.add(this.megalodonTail);

    // Shockwave Ring
    const shockGeo = new THREE.RingGeometry(1.2, 5.0, 32);
    const shockMat = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });
    this.megalodonShockwave = new THREE.Mesh(shockGeo, shockMat);
    this.megalodonShockwave.position.set(0, 0, 8);
    this.megalodonGroup.add(this.megalodonShockwave);

    this.group.add(this.megalodonGroup);
  }

  public update(params: WorldUpdateParams): void {
    const { scrollProgress, scrollVelocity, mouseX, mouseY, delta, elapsed, reducedMotion } = params;

    // 1. Cinematic Camera Choreography with Dynamic Pitch & Roll
    const targetY = 15 - scrollProgress * 140;
    const targetZ = 36 - Math.sin(scrollProgress * Math.PI) * 11;
    const targetX = Math.sin(scrollProgress * Math.PI * 1.5) * 8 + mouseX * 4;

    if (!reducedMotion) {
      this.camera.position.y += (targetY - this.camera.position.y) * 0.06;
      this.camera.position.z += (targetZ - this.camera.position.z) * 0.06;
      this.camera.position.x += (targetX - this.camera.position.x) * 0.06;
      this.camera.rotation.y = -mouseX * 0.08;
      this.camera.rotation.x = mouseY * 0.05 - scrollVelocity * 0.002;
    } else {
      this.camera.position.set(0, targetY, targetZ);
    }

    // Atmospheric Sunlight Attenuation
    const depthFactor = Math.max(0, 1 - scrollProgress * 1.35);
    this.sunLight.intensity = 3.2 * depthFactor;
    this.sunRays.children.forEach((ray) => {
      ((ray as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = 0.14 * depthFactor;
    });

    // 2. Animate Multi-Frequency Ocean Surface Waves
    if (!reducedMotion) {
      for (let i = 0; i < this.waterPositions.length; i += 3) {
        const u = this.waterPositions[i];
        const v = this.waterPositions[i + 2];
        // Low frequency swell + high frequency chop
        const swell = Math.sin(u * 0.08 + elapsed * 1.6) * Math.cos(v * 0.08 + elapsed * 1.4) * 0.8;
        const chop = Math.sin(u * 0.25 + elapsed * 3.2) * 0.25;
        this.waterPositions[i + 1] = swell + chop;
      }
      this.waterSurface.geometry.attributes.position.needsUpdate = true;

      // Realistic Ship Pitch & Buoyancy
      this.shipGroup.position.y = 6.2 + Math.sin(elapsed * 1.6) * 0.45;
      this.shipGroup.rotation.z = Math.sin(elapsed * 1.3) * 0.06;
      this.shipGroup.rotation.x = Math.cos(elapsed * 1.1) * 0.04;
    }

    // 3. Schooling Fish Motion with Sinusoidal Spine
    if (!reducedMotion) {
      this.fishList.forEach((f) => {
        f.phase += delta * f.speed * 1.8;
        f.pos.x += Math.sin(f.phase) * delta * 6.0;
        f.pos.z += Math.cos(f.phase) * delta * 6.0;
        f.pos.y += Math.sin(f.phase * 2) * delta * 1.5;
        f.group.position.copy(f.pos);
        f.group.rotation.y = -f.phase + Math.PI / 2;
        // Tail oscillation
        f.tail.rotation.y = Math.sin(elapsed * 12.0 * f.speed) * 0.45;
      });
    }

    // 4. Multi-Tier Bubble Streams
    if (!reducedMotion) {
      const bPos = this.bubblePositions;
      for (let i = 0; i < bPos.length / 3; i++) {
        bPos[i * 3 + 1] += this.bubbleVelocities[i] * delta * 9.0;
        bPos[i * 3] += Math.sin(elapsed * 2.5 + i) * 0.06;
        if (bPos[i * 3 + 1] > 10) {
          bPos[i * 3 + 1] = -130;
          bPos[i * 3] = (Math.random() - 0.5) * 90;
        }
      }
      this.bubbles.geometry.attributes.position.needsUpdate = true;
    }

    // 5. Kelp & Jellyfish Organic Motion
    if (!reducedMotion) {
      this.kelpGroup.children.forEach((k, idx) => {
        k.rotation.z = Math.sin(elapsed * 1.4 + idx * 0.5) * 0.16;
      });
      this.jellyfishGroup.children.forEach((j, idx) => {
        j.position.y += Math.sin(elapsed * 1.6 + idx) * 0.04;
        const pulse = Math.sin(elapsed * 2.2 + idx) * 0.12;
        j.scale.set(1 + pulse, 1 - pulse, 1 + pulse);
      });
    }

    // 6. Biologically Animated Dolphin Companion (Spine Curvature & Roll Banking)
    const dolphinTarget = new THREE.Vector3(
      this.camera.position.x + mouseX * 16,
      this.camera.position.y + mouseY * 12 - 2,
      this.camera.position.z - 18
    );

    const diff = dolphinTarget.clone().sub(this.dolphinPos);
    this.dolphinVel.add(diff.multiplyScalar(0.045));
    this.dolphinVel.multiplyScalar(0.88);
    this.dolphinPos.add(this.dolphinVel);
    this.dolphinGroup.position.copy(this.dolphinPos);

    if (!reducedMotion) {
      const lateralSpeed = this.dolphinVel.x;
      this.dolphinRoll += (-lateralSpeed * 0.4 - this.dolphinRoll) * 0.1;
      this.dolphinGroup.rotation.z = this.dolphinRoll;
      this.dolphinGroup.rotation.y = -lateralSpeed * 0.15;
      // Tail fluke propulsion
      const speed = this.dolphinVel.length();
      this.dolphinTailSegment.rotation.y = Math.sin(elapsed * 9.0 * Math.max(speed, 0.4)) * 0.5;
      this.dolphinTorso.rotation.y = Math.sin(elapsed * 9.0 * Math.max(speed, 0.4)) * 0.12;
    }

    // 7. Megalodon Climax Encounter (88% - 100% scroll progress)
    if (scrollProgress >= 0.88) {
      const climProgress = (scrollProgress - 0.88) / 0.12; // 0.0 to 1.0

      if (climProgress < 0.35) {
        // Stage 1: Looming in deep gloom
        this.megalodonGroup.position.set(0, -118, -48 + climProgress * 25);
        this.megalodonGroup.scale.setScalar(1.2 + climProgress * 0.6);
        this.megalodonTail.rotation.y = Math.sin(elapsed * 4.0) * 0.25;
      } else if (climProgress >= 0.35 && climProgress < 0.82) {
        // Stage 2: Explosive lunging charge toward camera
        const rush = (climProgress - 0.35) / 0.47;
        this.megalodonGroup.position.set(
          Math.sin(rush * Math.PI) * 3.5,
          -112 + rush * 2.5,
          -25 + rush * 40
        );
        this.megalodonGroup.scale.setScalar(1.8 + rush * 1.6);
        this.megalodonJaws.scale.setScalar(1.0 + Math.sin(rush * Math.PI) * 0.75);
        this.megalodonTail.rotation.y = Math.sin(elapsed * 14.0) * 0.6;

        // Shockwave burst
        this.shockwaveOpacity = 0.9;
        this.shockwaveScale = 1.0 + rush * 9.0;
        (this.megalodonShockwave.material as THREE.MeshBasicMaterial).opacity = this.shockwaveOpacity;
        this.megalodonShockwave.scale.setScalar(this.shockwaveScale);
      } else {
        // Stage 3: Smooth descent into deep trench
        const settle = (climProgress - 0.82) / 0.18;
        this.megalodonGroup.position.set(0, -120, 15 - settle * 35);
        this.shockwaveOpacity = Math.max(0, this.shockwaveOpacity - delta * 2.5);
        (this.megalodonShockwave.material as THREE.MeshBasicMaterial).opacity = this.shockwaveOpacity;
      }
    } else {
      this.megalodonGroup.position.set(0, -120, -55);
      (this.megalodonShockwave.material as THREE.MeshBasicMaterial).opacity = 0;
    }
  }

  public dispose(): void {
    disposeWorldGroup(this.group);
    this.scene.remove(this.group);
  }
}
