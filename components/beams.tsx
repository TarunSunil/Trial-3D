"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

type BeamProps = { beamWidth: number; beamHeight: number; beamNumber: number; lightColor: string; speed: number; noiseIntensity: number; rotation: number };

function BeamField({ beamWidth, beamHeight, beamNumber, speed, noiseIntensity, rotation }: BeamProps) {
  const group = useRef<THREE.Group>(null);
  const beams = useMemo(() => Array.from({ length: beamNumber }, (_, index) => ({ x: (index - beamNumber / 2) * (beamWidth * 1.28), z: -Math.random() * 1.8, height: beamHeight * (0.7 + Math.random() * 0.4), phase: Math.random() * Math.PI })), [beamHeight, beamNumber, beamWidth]);
  useFrame(({ clock }) => {
    if (!group.current) return;
    group.current.rotation.z = (rotation * Math.PI) / 180 + Math.sin(clock.elapsedTime * speed * 0.07) * 0.06;
    group.current.rotation.y = Math.sin(clock.elapsedTime * speed * 0.04) * 0.16;
  });
  return <group ref={group}>{beams.map((beam, index) => <mesh key={index} position={[beam.x, Math.sin(beam.phase) * 0.35, beam.z]} rotation={[0, 0, Math.sin(beam.phase) * 0.08]}><planeGeometry args={[beamWidth * 0.07, beam.height, 1, 36]} /><meshStandardMaterial color="#eff5ff" metalness={0.62} roughness={0.23} transparent opacity={Math.min(0.58, 0.18 + noiseIntensity * 0.06 + (index % 4) * 0.05)} /></mesh>)}</group>;
}

export default function Beams({ beamWidth = 2, beamHeight = 15, beamNumber = 12, lightColor = "#ffffff", speed = 2, noiseIntensity = 1.75, scale: _scale = 0.2, rotation = 0 }: { beamWidth?: number; beamHeight?: number; beamNumber?: number; lightColor?: string; speed?: number; noiseIntensity?: number; scale?: number; rotation?: number }) {
  return <div className="beams"><Canvas dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }}><color attach="background" args={["#090b13"]} /><ambientLight intensity={0.65} /><directionalLight position={[0, 4, 8]} color={lightColor} intensity={3} /><BeamField beamWidth={beamWidth} beamHeight={beamHeight} beamNumber={beamNumber} lightColor={lightColor} speed={speed} noiseIntensity={noiseIntensity} rotation={rotation} /><PerspectiveCamera makeDefault position={[0, 0, 13]} fov={35} /></Canvas></div>;
}
