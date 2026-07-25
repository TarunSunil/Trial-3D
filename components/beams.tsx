"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function BeamField() {
  const group = useRef<THREE.Group>(null);
  const beams = useMemo(() => Array.from({ length: 20 }, (_, index) => ({ x: (index - 10) * 0.44, z: -Math.random() * 1.8, height: 7 + Math.random() * 4, phase: Math.random() * Math.PI })), []);
  useFrame(({ clock }) => {
    if (!group.current) return;
    group.current.rotation.z = 0.45 + Math.sin(clock.elapsedTime * 0.14) * 0.06;
    group.current.rotation.y = Math.sin(clock.elapsedTime * 0.08) * 0.16;
  });
  return <group ref={group}>{beams.map((beam, index) => <mesh key={index} position={[beam.x, Math.sin(beam.phase) * 0.35, beam.z]} rotation={[0, 0, Math.sin(beam.phase) * 0.08]}><planeGeometry args={[0.14, beam.height, 1, 36]} /><meshStandardMaterial color="#eff5ff" metalness={0.62} roughness={0.23} transparent opacity={0.25 + (index % 4) * 0.06} /></mesh>)}</group>;
}

export default function Beams() {
  return <div className="beams"><Canvas dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }}><color attach="background" args={["#090b13"]} /><ambientLight intensity={0.65} /><directionalLight position={[0, 4, 8]} color="#e8f0ff" intensity={3} /><BeamField /><PerspectiveCamera makeDefault position={[0, 0, 13]} fov={35} /></Canvas></div>;
}
