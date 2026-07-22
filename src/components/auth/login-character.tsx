"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export type AnimationStep = 0 | 1 | 2 | 3 | 4;
// 0: Walk in from left
// 1: Wave to user
// 2: Pull login form into center
// 3: Place & lock form in center
// 4: Stand idle

interface LoginCharacterProps {
  step: AnimationStep;
  progress: number; // 0 to 1 progress within step
  isHovered?: boolean;
}

export function LoginCharacter({ step, progress, isHovered }: LoginCharacterProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const bodyRef = useRef<THREE.Group>(null!);
  const headRef = useRef<THREE.Group>(null!);
  const leftArmRef = useRef<THREE.Group>(null!);
  const rightArmRef = useRef<THREE.Group>(null!);
  const leftLegRef = useRef<THREE.Group>(null!);
  const rightLegRef = useRef<THREE.Group>(null!);
  const backpackRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    if (!groupRef.current) return;

    // Default base rotations
    let bodyRotY = 0;
    let headRotY = 0;
    let headRotX = 0;
    let lArmRotX = 0;
    let rArmRotX = 0;
    let lArmRotZ = 0;
    let rArmRotZ = 0;
    let lLegRotX = 0;
    let rLegRotX = 0;
    let bodyBob = Math.sin(time * 3) * 0.04;

    // Step specific limb animations
    if (step === 0) {
      // Walking in from left to right
      const walkSpeed = 12;
      lLegRotX = Math.sin(time * walkSpeed) * 0.6;
      rLegRotX = -Math.sin(time * walkSpeed) * 0.6;
      lArmRotX = -Math.sin(time * walkSpeed) * 0.5;
      rArmRotX = Math.sin(time * walkSpeed) * 0.5;
      bodyBob = Math.abs(Math.sin(time * walkSpeed)) * 0.08;
      bodyRotY = 0.3; // Facing slightly right
      headRotY = 0.1;
    } else if (step === 1) {
      // Waving hand to user
      const waveSpeed = 8;
      rArmRotZ = Math.PI / 1.5 + Math.sin(time * waveSpeed) * 0.3;
      rArmRotX = 0.2;
      lArmRotX = 0.1;
      headRotY = -0.3; // Looking at user
      headRotX = Math.sin(time * 2) * 0.05;
      bodyRotY = -0.2;
    } else if (step === 2) {
      // Pulling the form backwards (stepping back while pulling)
      const pullSpeed = 8;
      lLegRotX = Math.sin(time * pullSpeed) * 0.4;
      rLegRotX = -Math.sin(time * pullSpeed) * 0.4;
      // Reaching arms forward to pull form
      rArmRotX = -Math.PI / 2.5 + Math.sin(time * pullSpeed) * 0.1;
      lArmRotX = -Math.PI / 2.5 + Math.sin(time * pullSpeed) * 0.1;
      bodyRotY = -0.4;
      headRotY = 0.4;
      bodyBob = Math.abs(Math.sin(time * pullSpeed)) * 0.06;
    } else if (step === 3) {
      // Placing form down into place
      rArmRotX = -Math.PI / 4;
      lArmRotX = -Math.PI / 4;
      bodyRotY = -0.3;
      headRotX = 0.2; // Looking down at form
    } else {
      // Idle pose (arms crossed or relaxed, subtle breathing)
      const breath = Math.sin(time * 2.5);
      bodyBob = breath * 0.03;
      lArmRotX = 0.2 + breath * 0.02;
      rArmRotX = 0.2 + breath * 0.02;
      lArmRotZ = -0.15;
      rArmRotZ = 0.15;
      headRotY = isHovered ? Math.sin(time * 3) * 0.1 - 0.2 : -0.25;
      headRotX = isHovered ? -0.1 : 0;
      bodyRotY = -0.35; // Angle nicely towards the form
    }

    // Apply rotations smoothly
    if (bodyRef.current) {
      bodyRef.current.rotation.y = THREE.MathUtils.lerp(bodyRef.current.rotation.y, bodyRotY, 0.1);
      bodyRef.current.position.y = THREE.MathUtils.lerp(bodyRef.current.position.y, bodyBob, 0.1);
    }
    if (headRef.current) {
      headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, headRotY, 0.1);
      headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, headRotX, 0.1);
    }
    if (leftArmRef.current) {
      leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, lArmRotX, 0.1);
      leftArmRef.current.rotation.z = THREE.MathUtils.lerp(leftArmRef.current.rotation.z, lArmRotZ, 0.1);
    }
    if (rightArmRef.current) {
      rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, rArmRotX, 0.1);
      rightArmRef.current.rotation.z = THREE.MathUtils.lerp(rightArmRef.current.rotation.z, rArmRotZ, 0.1);
    }
    if (leftLegRef.current) {
      leftLegRef.current.rotation.x = THREE.MathUtils.lerp(leftLegRef.current.rotation.x, lLegRotX, 0.1);
    }
    if (rightLegRef.current) {
      rightLegRef.current.rotation.x = THREE.MathUtils.lerp(rightLegRef.current.rotation.x, rLegRotX, 0.1);
    }
  });

  return (
    <group ref={groupRef} dispose={null}>
      <group ref={bodyRef}>
        {/* Torso / Jacket */}
        <mesh position={[0, 1.15, 0]} castShadow receiveShadow>
          <capsuleGeometry args={[0.3, 0.55, 16, 32]} />
          <meshStandardMaterial color="#2563eb" roughness={0.3} metalness={0.2} />
        </mesh>

        {/* Jacket Collar / Accent */}
        <mesh position={[0, 1.45, 0.05]} castShadow>
          <torusGeometry args={[0.22, 0.05, 16, 32]} />
          <meshStandardMaterial color="#1e40af" roughness={0.4} />
        </mesh>

        {/* Backpack */}
        <group ref={backpackRef} position={[0, 1.15, -0.28]}>
          <mesh castShadow>
            <boxGeometry args={[0.42, 0.5, 0.22]} />
            <meshStandardMaterial color="#0284c7" roughness={0.5} />
          </mesh>
          <mesh position={[0, -0.1, -0.05]} castShadow>
            <boxGeometry args={[0.36, 0.2, 0.12]} />
            <meshStandardMaterial color="#0369a1" roughness={0.5} />
          </mesh>
        </group>

        {/* Head Group */}
        <group ref={headRef} position={[0, 1.75, 0]}>
          {/* Face Base */}
          <mesh castShadow>
            <sphereGeometry args={[0.26, 32, 32]} />
            <meshStandardMaterial color="#ffdbac" roughness={0.6} />
          </mesh>

          {/* Hair / Red Cap */}
          <group position={[0, 0.08, -0.02]}>
            <mesh castShadow>
              <sphereGeometry args={[0.275, 32, 16, 0, Math.PI * 2, 0, Math.PI / 1.8]} />
              <meshStandardMaterial color="#ef4444" roughness={0.3} />
            </mesh>
            {/* Cap Visor */}
            <mesh position={[0, -0.04, 0.24]} rotation={[0.25, 0, 0]} castShadow>
              <boxGeometry args={[0.32, 0.03, 0.22]} />
              <meshStandardMaterial color="#dc2626" roughness={0.3} />
            </mesh>
          </group>

          {/* Expressive Eyes */}
          <mesh position={[-0.09, 0.02, 0.23]}>
            <sphereGeometry args={[0.04, 16, 16]} />
            <meshStandardMaterial color="#0f172a" roughness={0.1} />
          </mesh>
          <mesh position={[0.09, 0.02, 0.23]}>
            <sphereGeometry args={[0.04, 16, 16]} />
            <meshStandardMaterial color="#0f172a" roughness={0.1} />
          </mesh>
          {/* Eye Shine */}
          <mesh position={[-0.08, 0.035, 0.26]}>
            <sphereGeometry args={[0.012, 8, 8]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh position={[0.1, 0.035, 0.26]}>
            <sphereGeometry args={[0.012, 8, 8]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>

          {/* Smile */}
          <mesh position={[0, -0.08, 0.24]} rotation={[0.2, 0, 0]}>
            <torusGeometry args={[0.05, 0.012, 8, 16, Math.PI]} />
            <meshStandardMaterial color="#9a3412" />
          </mesh>
        </group>

        {/* Left Arm */}
        <group ref={leftArmRef} position={[-0.38, 1.38, 0]}>
          <mesh position={[0, -0.28, 0]} castShadow>
            <capsuleGeometry args={[0.085, 0.45, 16, 16]} />
            <meshStandardMaterial color="#2563eb" roughness={0.4} />
          </mesh>
          {/* Hand */}
          <mesh position={[0, -0.56, 0]} castShadow>
            <sphereGeometry args={[0.09, 16, 16]} />
            <meshStandardMaterial color="#ffdbac" roughness={0.6} />
          </mesh>
        </group>

        {/* Right Arm */}
        <group ref={rightArmRef} position={[0.38, 1.38, 0]}>
          <mesh position={[0, -0.28, 0]} castShadow>
            <capsuleGeometry args={[0.085, 0.45, 16, 16]} />
            <meshStandardMaterial color="#2563eb" roughness={0.4} />
          </mesh>
          {/* Hand */}
          <mesh position={[0, -0.56, 0]} castShadow>
            <sphereGeometry args={[0.09, 16, 16]} />
            <meshStandardMaterial color="#ffdbac" roughness={0.6} />
          </mesh>
        </group>

        {/* Left Leg */}
        <group ref={leftLegRef} position={[-0.16, 0.75, 0]}>
          <mesh position={[0, -0.32, 0]} castShadow>
            <capsuleGeometry args={[0.1, 0.5, 16, 16]} />
            <meshStandardMaterial color="#1e293b" roughness={0.5} />
          </mesh>
          {/* Shoe */}
          <mesh position={[0, -0.65, 0.08]} castShadow>
            <boxGeometry args={[0.16, 0.14, 0.28]} />
            <meshStandardMaterial color="#ffffff" roughness={0.2} />
          </mesh>
        </group>

        {/* Right Leg */}
        <group ref={rightLegRef} position={[0.16, 0.75, 0]}>
          <mesh position={[0, -0.32, 0]} castShadow>
            <capsuleGeometry args={[0.1, 0.5, 16, 16]} />
            <meshStandardMaterial color="#1e293b" roughness={0.5} />
          </mesh>
          {/* Shoe */}
          <mesh position={[0, -0.65, 0.08]} castShadow>
            <boxGeometry args={[0.16, 0.14, 0.28]} />
            <meshStandardMaterial color="#ffffff" roughness={0.2} />
          </mesh>
        </group>
      </group>
    </group>
  );
}
