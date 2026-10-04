/**
 * Gradient AI — The Ocean Descent (Landing Page World)
 * Features:
 * - Ship on the ocean surface & sun rays
 * - Water waves & sunlight transition
 * - Underwater descent with swimming fish schools, bubbles, kelp forest, bioluminescent jellyfish
 * - Dolphin companion following cursor naturally with swimming spine undulation & bubble trail
 * - Deep trench canyon walls
 * - Megalodon Climax: Looming silhouette, explosive lunging rush toward camera, shockwave particles
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

  // Environment elements
  private sunLight: THREE.DirectionalLight;
  private oceanLight: THREE.PointLight;
  private waterSurface: THREE.Mesh;
  private waterPositions: Float32Array;
  private shipGroup: THREE.Group;
  private sunRays: THREE.Group;

  // Marine Life & Particles
  private fishGroup: THREE.Group;
  private fishMeshes: { mesh: THREE.Group; speed: number; phase: number; radius: number; depth: number }[] = [];
  private bubbles: THREE.Points;
  private bubblePositions: Float32Array;
  private bubbleVelocities: Float32Array;
  private kelpGroup: THREE.Group;
  private jellyfishGroup: THREE.Group;
  private trenchGroup: THREE.Group;

  // Dolphin Companion
  private dolphinGroup: THREE.Group;
  private dolphinBody: THREE.Mesh;
  private dolphinTail: THREE.Mesh;
  private dolphinFlippers: THREE.Group;
  private dolphinPos = new THREE.Vector3(0, 0, 15);
  private dolphinVel = new THREE.Vector3(0, 0, 0);
  private dolphinTarget = new THREE.Vector3();
  private waveFrame = 0;

  // Megalodon Climax
  private megalodonGroup: THREE.Group;
  private megalodonJaws: THREE.Mesh;
  private megalodonEyes: THREE.Mesh;
  private megalodonShockwave: THREE.Mesh;
  private shockwaveScale = 1.0;
  private shockwaveOpacity = 0.0;

  constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera, isMobile: boolean) {
    this.scene = scene;
    this.camera = camera;
    this.group = new THREE.Group();
    this.scene.add(this.group);
    this.scene.fog = new THREE.FogExp2(0x062235, 0.012);
    this.group.add(new THREE.HemisphereLight(0x9ddcff, 0x03202b, 1.25));

    // 1. Lighting
    this.sunLight = new THREE.DirectionalLight(0xfff5e6, 2.5);
    this.sunLight.position.set(20, 60, 30);
    this.group.add(this.sunLight);

    this.oceanLight = new THREE.PointLight(0x06b6d4, 2.0, 100);
    this.oceanLight.position.set(0, -20, 0);
    this.group.add(this.oceanLight);

    // 2. Ocean Surface & Sky
    const waterGeo = new THREE.PlaneGeometry(300, 300, 32, 32);
    waterGeo.rotateX(-Math.PI / 2);
    this.waterPositions = waterGeo.attributes.position.array as Float32Array;
    const waterMat = new THREE.MeshPhysicalMaterial({
      color: 0x075a79,
      roughness: 0.18,
      metalness: 0.15,
      clearcoat: 0.85,
      clearcoatRoughness: 0.08,
      transmission: 0.08,
      transparent: true,
      opacity: 0.75,
      wireframe: false,
    });
    this.waterSurface = new THREE.Mesh(waterGeo, waterMat);
    this.waterSurface.position.set(0, 5, 0);
    this.group.add(this.waterSurface);

    // 3. Research Vessel / Ship at Sea Surface
    this.shipGroup = new THREE.Group();
    this.shipGroup.position.set(25, 5.5, -15);
    
    // Hull
    const hullGeo = new THREE.ConeGeometry(5, 18, 6);
    hullGeo.rotateZ(Math.PI / 2);
    hullGeo.rotateY(Math.PI / 2);
    const hullMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 });
    const hull = new THREE.Mesh(hullGeo, hullMat);
    hull.scale.set(0.6, 0.4, 1.2);
    this.shipGroup.add(hull);

    // Cabin
    const cabinGeo = new THREE.BoxGeometry(4, 3, 6);
    const cabinMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.3 });
    const cabin = new THREE.Mesh(cabinGeo, cabinMat);
    cabin.position.set(0, 2, -1);
    this.shipGroup.add(cabin);

    // Mast & Lights
    const mastGeo = new THREE.CylinderGeometry(0.15, 0.15, 8);
    const mastMat = new THREE.MeshBasicMaterial({ color: 0x94a3b8 });
    const mast = new THREE.Mesh(mastGeo, mastMat);
    mast.position.set(0, 5, 0);
    this.shipGroup.add(mast);

    const shipLight = new THREE.PointLight(0x10b981, 3, 25);
    shipLight.position.set(0, 8, 0);
    this.shipGroup.add(shipLight);

    this.group.add(this.shipGroup);

    // 4. Volumetric Sun Rays
    this.sunRays = new THREE.Group();
    const rayGeo = new THREE.CylinderGeometry(0.5, 8, 50, 8, 1, true);
    const rayMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.12,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    for (let i = 0; i < 5; i++) {
      const ray = new THREE.Mesh(rayGeo, rayMat);
      ray.position.set(-20 + i * 10, -15, -10 + (i % 2) * 8);
      ray.rotation.z = 0.2 + i * 0.05;
      this.sunRays.add(ray);
    }
    this.group.add(this.sunRays);

    // 5. Swimming Schools of Fish
    this.fishGroup = new THREE.Group();
    const fishCount = isMobile ? 16 : 36;
    const fishBodyGeo = new THREE.ConeGeometry(0.4, 1.5, 4);
    fishBodyGeo.rotateZ(-Math.PI / 2);
    const fishMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.4,
      roughness: 0.3,
    });

    for (let i = 0; i < fishCount; i++) {
      const fish = new THREE.Group();
      const body = new THREE.Mesh(fishBodyGeo, fishMat);
      fish.add(body);

      const radius = 12 + Math.random() * 30;
      const depth = -15 - Math.random() * 80;
      fish.position.set(
        Math.cos((i / fishCount) * Math.PI * 2) * radius,
        depth,
        Math.sin((i / fishCount) * Math.PI * 2) * radius
      );
      this.fishGroup.add(fish);
      this.fishMeshes.push({
        mesh: fish,
        speed: 0.8 + Math.random() * 0.8,
        phase: Math.random() * Math.PI * 2,
        radius,
        depth,
      });
    }
    this.group.add(this.fishGroup);

    // 6. Rising Underwater Bubble Stream
    const bubbleCount = isMobile ? 80 : 200;
    const bubbleGeo = new THREE.BufferGeometry();
    this.bubblePositions = new Float32Array(bubbleCount * 3);
    this.bubbleVelocities = new Float32Array(bubbleCount);

    for (let i = 0; i < bubbleCount; i++) {
      this.bubblePositions[i * 3] = (Math.random() - 0.5) * 80;
      this.bubblePositions[i * 3 + 1] = -120 + Math.random() * 130;
      this.bubblePositions[i * 3 + 2] = (Math.random() - 0.5) * 60;
      this.bubbleVelocities[i] = 2.0 + Math.random() * 4.0;
    }
    bubbleGeo.setAttribute("position", new THREE.BufferAttribute(this.bubblePositions, 3));

    const bubbleMat = new THREE.PointsMaterial({
      color: 0x7dd3fc,
      size: isMobile ? 1.8 : 2.6,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });
    this.bubbles = new THREE.Points(bubbleGeo, bubbleMat);
    this.group.add(this.bubbles);

    // 7. Kelp & Bioluminescent Jellyfish
    this.kelpGroup = new THREE.Group();
    const kelpMat = new THREE.MeshStandardMaterial({
      color: 0x065f46,
      emissive: 0x064e3b,
      emissiveIntensity: 0.3,
      roughness: 0.6,
    });
    for (let i = 0; i < (isMobile ? 10 : 25); i++) {
      const strand = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.3, 20 + Math.random() * 15, 5), kelpMat);
      strand.position.set((Math.random() - 0.5) * 70, -100, (Math.random() - 0.5) * 70);
      this.kelpGroup.add(strand);
    }
    this.group.add(this.kelpGroup);

    this.jellyfishGroup = new THREE.Group();
    const jellyMat = new THREE.MeshStandardMaterial({
      color: 0x2dd4bf,
      emissive: 0x06b6d4,
      emissiveIntensity: 1.2,
      transparent: true,
      opacity: 0.7,
      roughness: 0.1,
    });
    for (let i = 0; i < 6; i++) {
      const jelly = new THREE.Group();
      const cap = new THREE.Mesh(new THREE.SphereGeometry(1.4, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), jellyMat);
      jelly.add(cap);
      jelly.position.set((Math.random() - 0.5) * 40, -60 - i * 12, (Math.random() - 0.5) * 40);
      this.jellyfishGroup.add(jelly);
    }
    this.group.add(this.jellyfishGroup);

    // 8. Deep Trench Canyon Walls
    this.trenchGroup = new THREE.Group();
    const wallGeo = new THREE.BoxGeometry(20, 90, 80);
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x08131d,
      roughness: 0.9,
    });
    const leftWall = new THREE.Mesh(wallGeo, wallMat);
    leftWall.position.set(-35, -100, -20);
    this.trenchGroup.add(leftWall);

    const rightWall = new THREE.Mesh(wallGeo, wallMat);
    rightWall.position.set(35, -100, -20);
    this.trenchGroup.add(rightWall);
    this.group.add(this.trenchGroup);

    // 9. Dolphin Companion (Cursor-following 3D creature)
    this.dolphinGroup = new THREE.Group();
    
    // Dolphin Body
    const dolphGeo = new THREE.ConeGeometry(0.9, 4.2, 8);
    dolphGeo.rotateZ(-Math.PI / 2);
    const dolphMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0369a1,
      emissiveIntensity: 0.5,
      roughness: 0.2,
      metalness: 0.3,
    });
    this.dolphinBody = new THREE.Mesh(dolphGeo, dolphMat);
    this.dolphinGroup.add(this.dolphinBody);

    // Dorsal Fin
    const finGeo = new THREE.ConeGeometry(0.35, 1.2, 4);
    finGeo.rotateZ(Math.PI / 4);
    const fin = new THREE.Mesh(finGeo, dolphMat);
    fin.position.set(-0.3, 0.9, 0);
    this.dolphinGroup.add(fin);

    // Flippers
    this.dolphinFlippers = new THREE.Group();
    const flip1 = new THREE.Mesh(finGeo, dolphMat);
    flip1.rotation.set(0, 0, -Math.PI / 3);
    flip1.position.set(0.5, -0.4, 0.8);
    this.dolphinFlippers.add(flip1);

    const flip2 = new THREE.Mesh(finGeo, dolphMat);
    flip2.rotation.set(0, 0, -Math.PI / 3);
    flip2.position.set(0.5, -0.4, -0.8);
    this.dolphinFlippers.add(flip2);
    this.dolphinGroup.add(this.dolphinFlippers);

    // Tail Fluke
    const flukeGeo = new THREE.BoxGeometry(0.8, 0.1, 2.0);
    this.dolphinTail = new THREE.Mesh(flukeGeo, dolphMat);
    this.dolphinTail.position.set(-2.2, 0, 0);
    this.dolphinGroup.add(this.dolphinTail);

    this.dolphinGroup.scale.setScalar(0.9);
    this.group.add(this.dolphinGroup);

    // 10. Megalodon Climax Encounter (At Deep Trench)
    this.megalodonGroup = new THREE.Group();
    this.megalodonGroup.position.set(0, -115, -45); // Deep in trench

    // Massive Shark Head & Body
    const megHeadGeo = new THREE.ConeGeometry(5.5, 16, 8);
    megHeadGeo.rotateZ(Math.PI / 2);
    const megMat = new THREE.MeshStandardMaterial({
      color: 0x0b1723,
      emissive: 0x050c12,
      roughness: 0.7,
    });
    const megHead = new THREE.Mesh(megHeadGeo, megMat);
    this.megalodonGroup.add(megHead);

    // Open Jaws with Sharp Teeth
    const jawGeo = new THREE.TorusGeometry(3.6, 0.6, 6, 12, Math.PI);
    jawGeo.rotateZ(Math.PI / 2);
    const toothMat = new THREE.MeshBasicMaterial({ color: 0xf1f5f9 });
    this.megalodonJaws = new THREE.Mesh(jawGeo, toothMat);
    this.megalodonJaws.position.set(7.5, -1.0, 0);
    this.megalodonGroup.add(this.megalodonJaws);

    // Glowing Predatory Eyes
    const eyeGeo = new THREE.SphereGeometry(0.4, 8, 8);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x34d399 });
    const eye1 = new THREE.Mesh(eyeGeo, eyeMat);
    eye1.position.set(4.5, 2.0, 3.2);
    const eye2 = new THREE.Mesh(eyeGeo, eyeMat);
    eye2.position.set(4.5, 2.0, -3.2);
    this.megalodonEyes = new THREE.Mesh();
    this.megalodonEyes.add(eye1);
    this.megalodonEyes.add(eye2);
    this.megalodonGroup.add(this.megalodonEyes);

    // Giant Dorsal Fin
    const megFinGeo = new THREE.ConeGeometry(2.2, 7.0, 4);
    megFinGeo.rotateZ(Math.PI / 5);
    const megFin = new THREE.Mesh(megFinGeo, megMat);
    megFin.position.set(-2.0, 5.0, 0);
    this.megalodonGroup.add(megFin);

    // Shockwave Ring
    const shockGeo = new THREE.RingGeometry(1, 4, 32);
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

    // 1. Camera Vertical Descent into Ocean Abyss (y: +15 above water down to -125 in deep trench)
    const targetY = 15 - scrollProgress * 140;
    const targetZ = 35 - Math.sin(scrollProgress * Math.PI) * 10;
    const targetX = Math.sin(scrollProgress * Math.PI * 1.5) * 8 + mouseX * 4;

    if (!reducedMotion) {
      this.camera.position.y += (targetY - this.camera.position.y) * 0.06;
      this.camera.position.z += (targetZ - this.camera.position.z) * 0.06;
      this.camera.position.x += (targetX - this.camera.position.x) * 0.06;
      this.camera.rotation.y = -mouseX * 0.08;
      this.camera.rotation.x = (mouseY * 0.05) - (scrollVelocity * 0.002);
    } else {
      this.camera.position.set(0, targetY, targetZ);
    }

    // Adjust lighting depth: Sunlight fades as we descend
    const depthFactor = Math.max(0, 1 - scrollProgress * 1.3);
    this.sunLight.intensity = 2.5 * depthFactor;
    this.sunRays.children.forEach((ray) => {
      ((ray as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = 0.12 * depthFactor;
    });

    // 2. Animate Water Surface Waves
    if (!reducedMotion) {
      for (let i = 0; i < this.waterPositions.length; i += 3) {
        const u = this.waterPositions[i];
        const v = this.waterPositions[i + 2];
        this.waterPositions[i + 1] =
          Math.sin(u * 0.045 + elapsed * 0.7) * 0.8 +
          Math.cos(v * 0.075 - elapsed * 1.05) * 0.32 +
          Math.sin((u + v) * 0.18 + elapsed * 1.7) * 0.1;
      }
      this.waterSurface.geometry.attributes.position.needsUpdate = true;
      if (++this.waveFrame % 3 === 0) this.waterSurface.geometry.computeVertexNormals();
      this.shipGroup.position.y = 5.5 + Math.sin(elapsed * 1.5) * 0.4;
      this.shipGroup.rotation.z = Math.sin(elapsed * 1.2) * 0.05;
    }

    // 3. Animate Fish Schools
    if (!reducedMotion) {
      this.fishMeshes.forEach((f) => {
        f.phase += delta * f.speed;
        f.mesh.position.x = Math.cos(f.phase) * f.radius;
        f.mesh.position.z = Math.sin(f.phase) * f.radius;
        f.mesh.position.y = f.depth + Math.sin(f.phase * 2) * 1.5;
        f.mesh.rotation.y = -f.phase + Math.PI / 2;
      });
    }

    // 4. Animate Rising Bubbles
    if (!reducedMotion) {
      const bPos = this.bubblePositions;
      for (let i = 0; i < bPos.length / 3; i++) {
        bPos[i * 3 + 1] += this.bubbleVelocities[i] * delta * 8.0;
        bPos[i * 3] += Math.sin(elapsed * 2.0 + i) * 0.05;
        if (bPos[i * 3 + 1] > 10) {
          bPos[i * 3 + 1] = -120;
          bPos[i * 3] = (Math.random() - 0.5) * 80;
        }
      }
      this.bubbles.geometry.attributes.position.needsUpdate = true;
    }

    // 5. Kelp & Jellyfish motion
    if (!reducedMotion) {
      this.kelpGroup.children.forEach((k, idx) => {
        k.rotation.z = Math.sin(elapsed * 1.2 + idx) * 0.12;
      });
      this.jellyfishGroup.children.forEach((j, idx) => {
        j.position.y += Math.sin(elapsed * 1.5 + idx) * 0.03;
        j.scale.set(1 + Math.sin(elapsed * 2.0 + idx) * 0.1, 1 - Math.sin(elapsed * 2.0 + idx) * 0.1, 1);
      });
    }

    // 6. Dolphin Cursor Companion (Swims smoothly near pointer)
    this.dolphinTarget.set(
      this.camera.position.x + mouseX * 11 + Math.sin(elapsed * 0.35) * 3,
      this.camera.position.y + mouseY * 8 - 2 + Math.cos(elapsed * 0.55) * 1.2,
      this.camera.position.z - 18
    );
    this.dolphinTarget.sub(this.dolphinPos);
    this.dolphinVel.addScaledVector(this.dolphinTarget, 0.035);
    this.dolphinVel.multiplyScalar(0.88);
    this.dolphinPos.add(this.dolphinVel);
    this.dolphinGroup.position.copy(this.dolphinPos);

    if (!reducedMotion) {
      // Rotate dolphin toward movement direction
      const angle = Math.atan2(this.dolphinVel.y, this.dolphinVel.x);
      this.dolphinGroup.rotation.z = angle * 0.5;
      this.dolphinGroup.rotation.y = -this.dolphinVel.x * 0.1;
      // Tail undulation
      this.dolphinTail.rotation.y = Math.sin(elapsed * 8.0) * 0.4;
      this.dolphinBody.rotation.y = Math.sin(elapsed * 8.0) * 0.1;
    }

    // 7. Megalodon Climax Jumpscare Sequence (88% - 100% scroll progress)
    if (scrollProgress >= 0.88) {
      const climProgress = (scrollProgress - 0.88) / 0.12; // 0.0 to 1.0

      if (climProgress < 0.4) {
        // Looming in the distance
        this.megalodonGroup.position.set(0, -118, -40 + climProgress * 20);
        this.megalodonGroup.scale.setScalar(1.2 + climProgress * 0.5);
        this.megalodonGroup.rotation.y = Math.sin(elapsed * 2) * 0.1;
      } else if (climProgress >= 0.4 && climProgress < 0.85) {
        // Explosive lunge toward camera
        const rush = (climProgress - 0.4) / 0.45;
        this.megalodonGroup.position.set(
          Math.sin(rush * Math.PI) * 3,
          -112 + rush * 2,
          -25 + rush * 38 // rushes close to camera!
        );
        this.megalodonGroup.scale.setScalar(1.8 + rush * 1.5);
        this.megalodonJaws.scale.setScalar(1.0 + Math.sin(rush * Math.PI) * 0.6);

        // Shockwave trigger
        this.shockwaveOpacity = 0.85;
        this.shockwaveScale = 1.0 + rush * 8.0;
        (this.megalodonShockwave.material as THREE.MeshBasicMaterial).opacity = this.shockwaveOpacity;
        this.megalodonShockwave.scale.setScalar(this.shockwaveScale);
      } else {
        // Settles into abyss
        const settle = (climProgress - 0.85) / 0.15;
        this.megalodonGroup.position.set(0, -120, 10 - settle * 30);
        this.shockwaveOpacity = Math.max(0, this.shockwaveOpacity - delta * 2);
        (this.megalodonShockwave.material as THREE.MeshBasicMaterial).opacity = this.shockwaveOpacity;
      }
    } else {
      this.megalodonGroup.position.set(0, -120, -50);
      (this.megalodonShockwave.material as THREE.MeshBasicMaterial).opacity = 0;
    }
  }

  public dispose(): void {
    this.scene.remove(this.group);
    disposeWorldGroup(this.group);
  }
}
