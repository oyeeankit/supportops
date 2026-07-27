"use client";

import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useCharacterContext } from "./character-context";

export type EntranceStep =
  | "entering"
  | "turning"
  | "reaching"
  | "straining"
  | "pulling"
  | "settling"
  | "adjusting"
  | "idle"
  | "exiting";

interface HumanCharacterProps {
  entranceStep: EntranceStep;
  formPosition?: [number, number, number];
  formRotation?: [number, number, number];
}

type AvatarBones = {
  head: THREE.Object3D | null;
  spine: THREE.Object3D | null;
  lArm: THREE.Object3D | null;
  rArm: THREE.Object3D | null;
  lForearm: THREE.Object3D | null;
  rForearm: THREE.Object3D | null;
  lLeg: THREE.Object3D | null;
  rLeg: THREE.Object3D | null;
};

// Render authentic GLB 3D Human Avatar Model with Skeletal Rigging
function AuthenticGLTFAvatar({ entranceStep }: { entranceStep: EntranceStep }) {
  const { scene } = useGLTF("/models/avatar.glb");
  const { activeInput, hoveredField, isTyping, authStatus, mousePos } = useCharacterContext();
  const avatarGroupRef = useRef<THREE.Group>(null!);

  // Clone scene so materials and bone transforms are unique per instance
  const clonedScene = useMemo(() => scene.clone(true), [scene]);

  // Find humanoid skeletal bones dynamically
  const bones = useMemo<AvatarBones>(() => {
    let head: THREE.Object3D | null = null;
    let spine: THREE.Object3D | null = null;
    let lArm: THREE.Object3D | null = null;
    let rArm: THREE.Object3D | null = null;
    let lForearm: THREE.Object3D | null = null;
    let rForearm: THREE.Object3D | null = null;
    let lLeg: THREE.Object3D | null = null;
    let rLeg: THREE.Object3D | null = null;

    clonedScene.traverse((obj) => {
      const name = obj.name.toLowerCase();
      if (!head && (name.includes("head") || name.includes("neck"))) head = obj;
      if (!spine && (name.includes("spine") || name.includes("chest"))) spine = obj;
      if (!lArm && (name.includes("leftarm") || name.includes("arm_l") || name.includes("left_arm"))) lArm = obj;
      if (!rArm && (name.includes("rightarm") || name.includes("arm_r") || name.includes("right_arm"))) rArm = obj;
      if (!lForearm && (name.includes("leftforearm") || name.includes("forearm_l"))) lForearm = obj;
      if (!rForearm && (name.includes("rightforearm") || name.includes("forearm_r"))) rForearm = obj;
      if (!lLeg && (name.includes("leftupleg") || name.includes("leg_l") || name.includes("left_leg"))) lLeg = obj;
      if (!rLeg && (name.includes("rightupleg") || name.includes("leg_r") || name.includes("right_leg"))) rLeg = obj;
    });

    return { head, spine, lArm, rArm, lForearm, rForearm, lLeg, rLeg };
  }, [clonedScene]);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    if (!avatarGroupRef.current) return;

    let bodyYRot = 0;
    let bodyYOffset = 0;
    let spineXRot = 0;
    let spineZRot = 0;
    let headYRot = 0;
    let headXRot = 0;

    let lArmX = 0;
    let lArmZ = 0.1;
    let rArmX = 0;
    let rArmZ = -0.1;

    let lLegX = 0;
    let rLegX = 0;

    // --- 7-STAGE KINEMATICS FOR GLB SKELETON ---
    if (entranceStep === "entering") {
      const walkSpeed = 9;
      const legCycle = Math.sin(time * walkSpeed);
      lLegX = legCycle * 0.5;
      rLegX = -legCycle * 0.5;

      lArmX = -legCycle * 0.4;
      rArmX = legCycle * 0.4;
      bodyYRot = 0.25;
      headYRot = 0.2;
      bodyYOffset = Math.abs(Math.sin(time * walkSpeed)) * 0.05;
    } else if (entranceStep === "turning") {
      bodyYRot = -Math.PI / 2.2;
      headYRot = 0.1;
      spineXRot = 0.05;
    } else if (entranceStep === "reaching") {
      bodyYRot = -Math.PI / 2.2;
      spineXRot = 0.12;
      lArmX = -Math.PI / 2.3;
      rArmX = -Math.PI / 2.3;
      lArmZ = 0.35;
      rArmZ = -0.35;
    } else if (entranceStep === "straining") {
      bodyYRot = -Math.PI / 2.2;
      bodyYOffset = -0.06;
      spineXRot = -0.22;
      lLegX = -0.3;
      rLegX = 0.2;
      lArmX = -Math.PI / 2.5;
      rArmX = -Math.PI / 2.5;
      lArmZ = 0.3;
      rArmZ = -0.3;
    } else if (entranceStep === "pulling") {
      const pullSpeed = 8;
      const pullCycle = Math.sin(time * pullSpeed);
      lLegX = -pullCycle * 0.48;
      rLegX = pullCycle * 0.48;

      bodyYRot = -Math.PI / 2.2;
      bodyYOffset = Math.abs(Math.sin(time * pullSpeed)) * 0.04;
      spineXRot = -0.18 + Math.sin(time * pullSpeed * 2) * 0.03;

      lArmX = -Math.PI / 2.5;
      rArmX = -Math.PI / 2.5;
      lArmZ = 0.28;
      rArmZ = -0.28;
      headYRot = 0.15;
    } else if (entranceStep === "settling") {
      bodyYRot = -Math.PI / 2.2;
      bodyYOffset = -0.03;
      spineXRot = 0.08;
      lArmX = -Math.PI / 3.2;
      rArmX = -Math.PI / 3.2;
    } else if (entranceStep === "adjusting") {
      const nudge = Math.sin(time * 6) * 0.1;
      bodyYRot = -Math.PI / 2.2 + nudge * 0.1;
      lArmX = -Math.PI / 3.5 + nudge * 0.2;
      rArmX = -Math.PI / 3.5 - nudge * 0.2;
    } else if (entranceStep === "exiting" || authStatus === "success") {
      const exitSpeed = 8.5;
      const exitCycle = Math.sin(time * exitSpeed);
      lLegX = exitCycle * 0.55;
      rLegX = -exitCycle * 0.55;
      lArmX = -exitCycle * 0.4;
      rArmX = -Math.PI / 2.8;
      rArmZ = -0.4;
      bodyYRot = 0.4;
    } else {
      // IDLE REACTION POSES
      const breath = Math.sin(time * 2.2);
      const shift = Math.sin(time * 0.8);

      bodyYOffset = breath * 0.015;
      spineZRot = shift * 0.03;
      spineXRot = breath * 0.015;
      lArmX = 0.08 + breath * 0.02;
      rArmX = 0.08 + breath * 0.02;
      lArmZ = 0.12;
      rArmZ = -0.12;

      headYRot = -0.28;

      const mouseHeadY = (mousePos.x / (typeof window !== "undefined" ? window.innerWidth : 1000) - 0.5) * 0.3;
      const mouseHeadX = (mousePos.y / (typeof window !== "undefined" ? window.innerHeight : 1000) - 0.5) * 0.2;
      headYRot += mouseHeadY;
      headXRot += mouseHeadX;

      if (hoveredField !== "none") {
        headYRot -= 0.12;
        headXRot += 0.08;
      }

      if (isTyping) {
        const nod = Math.sin(time * 12) * 0.05;
        headXRot += nod + 0.05;
      }

      if (activeInput === "password") {
        spineXRot = 0.25;
        headXRot = -0.15;
        lArmX = -0.3;
        rArmX = -0.3;
      }

      if (authStatus === "error") {
        lArmX = 0.2;
        rArmX = 0.2;
        lArmZ = 0.45;
        rArmZ = -0.45;
        headYRot = 0.25;
        headXRot = -0.15;
      }
    }

    // Apply smooth lerped rotations to avatar root & bone hierarchy
    if (avatarGroupRef.current) {
      avatarGroupRef.current.rotation.y = THREE.MathUtils.lerp(avatarGroupRef.current.rotation.y, bodyYRot, 0.12);
      avatarGroupRef.current.position.y = THREE.MathUtils.lerp(avatarGroupRef.current.position.y, -1.05 + bodyYOffset, 0.12);
    }

    if (bones.spine) {
      bones.spine.rotation.x = THREE.MathUtils.lerp(bones.spine.rotation.x, spineXRot, 0.12);
      bones.spine.rotation.z = THREE.MathUtils.lerp(bones.spine.rotation.z, spineZRot, 0.12);
    }
    if (bones.head) {
      bones.head.rotation.y = THREE.MathUtils.lerp(bones.head.rotation.y, headYRot, 0.12);
      bones.head.rotation.x = THREE.MathUtils.lerp(bones.head.rotation.x, headXRot, 0.12);
    }
    if (bones.lArm) {
      bones.lArm.rotation.x = THREE.MathUtils.lerp(bones.lArm.rotation.x, lArmX, 0.14);
      bones.lArm.rotation.z = THREE.MathUtils.lerp(bones.lArm.rotation.z, lArmZ, 0.14);
    }
    if (bones.rArm) {
      bones.rArm.rotation.x = THREE.MathUtils.lerp(bones.rArm.rotation.x, rArmX, 0.14);
      bones.rArm.rotation.z = THREE.MathUtils.lerp(bones.rArm.rotation.z, rArmZ, 0.14);
    }
    if (bones.lLeg) {
      bones.lLeg.rotation.x = THREE.MathUtils.lerp(bones.lLeg.rotation.x, lLegX, 0.16);
    }
    if (bones.rLeg) {
      bones.rLeg.rotation.x = THREE.MathUtils.lerp(bones.rLeg.rotation.x, rLegX, 0.16);
    }
  });

  return (
    <group ref={avatarGroupRef} position={[0, -1.05, 0]}>
      <primitive object={clonedScene} scale={1.25} castShadow receiveShadow />
    </group>
  );
}

// Preload GLB Avatar model
useGLTF.preload("/models/avatar.glb");

export function HumanCharacter({ entranceStep }: HumanCharacterProps) {
  return (
    <React.Suspense fallback={null}>
      <AuthenticGLTFAvatar entranceStep={entranceStep} />
    </React.Suspense>
  );
}
