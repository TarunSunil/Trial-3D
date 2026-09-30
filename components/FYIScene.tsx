"use client";

import { Canvas, useFrame, extend } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useRef, useState, useEffect } from "react";
import * as THREE from "three";

extend({ Group: THREE.Group });
extend({ Mesh: THREE.Mesh });
extend({ SphereGeometry: THREE.SphereGeometry });
extend({ CylinderGeometry: THREE.CylinderGeometry });
extend({ AmbientLight: THREE.AmbientLight });
extend({ DirectionalLight: THREE.DirectionalLight });
extend({ MeshStandardMaterial: THREE.MeshStandardMaterial });
extend({ MeshBasicMaterial: THREE.MeshBasicMaterial });

function GraphScene({ graphRef, nodesRef }: { graphRef: React.RefObject<THREE.Group | null>; nodesRef: React.RefObject<THREE.Mesh[]> }) {
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (graphRef.current) {
      graphRef.current.rotation.y = Math.sin(time * 0.08) * 0.15;
      graphRef.current.rotation.x = Math.cos(time * 0.06) * 0.08;
    }
    nodesRef.current.forEach((node, i) => {
      const phase = (i / nodesRef.current.length) * Math.PI * 2;
      const pulse = Math.sin(time * 2 + phase) * 0.3 + 0.7;
      node.scale.setScalar(pulse);
      const mat = node.material as THREE.MeshStandardMaterial;
      if (mat) mat.emissiveIntensity = 0.4 + Math.sin(time * 3 + phase) * 0.3;
    });
  });
  return null;
}

export default function FYIScene() {
  const [mounted, setMounted] = useState(false);
  const graphRef = useRef<THREE.Group | null>(null);
  const nodesRef = useRef<THREE.Mesh[]>([]);
  const timeRef = useRef(0);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)" }}>Loading memory graph…</div>;

  const nodePositions = [
    [0, 0, 0] as [number, number, number],
    [2, 1, -1] as [number, number, number],
    [-2, 1.5, 0.5] as [number, number, number],
    [1.5, -1.2, 1] as [number, number, number],
    [-1.8, -0.8, -1.5] as [number, number, number],
    [0, 2.5, 0] as [number, number, number],
    [2.5, 0, 1.5] as [number, number, number],
    [-2.5, -1, 1] as [number, number, number],
    [0.5, 2, -1.8] as [number, number, number],
    [-1, -2, 0.5] as [number, number, number],
    [1.8, 1.8, -0.5] as [number, number, number],
    [-1.5, 2, 1] as [number, number, number],
    [0.8, -2.2, -1] as [number, number, number],
    [-2.2, 0.5, -1.2] as [number, number, number],
    [1.2, -0.5, 1.8] as [number, number, number],
  ];

  return (
    <div style={{ width: "100%", height: "100%", minHeight: 400 }}>
      <Canvas
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 1, 5], fov: 45 }}
        style={{ width: "100%", height: "100%", display: "block" }}
      >
        <GraphScene graphRef={graphRef} nodesRef={nodesRef} />
        <OrbitControls enablePan={false} enableZoom={false} minPolarAngle={0.3} maxPolarAngle={2.3} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[2, 4, 3]} intensity={1.2} />
        <directionalLight position={[-3, 2, -2]} intensity={0.6} color="#9db7ff" />

        <group ref={graphRef}>
          {nodePositions.map((pos, i) => (
            <group key={i} position={pos}>
              <mesh ref={(r) => { if (r) nodesRef.current[i] = r; }}>
                <sphereGeometry args={[0.18, 16, 16]} />
                <meshStandardMaterial
                  color="#9db7ff"
                  emissive="#9db7ff"
                  emissiveIntensity={0.5}
                  transparent
                  opacity={0.9}
                />
              </mesh>
              <mesh>
                <sphereGeometry args={[0.35, 16, 16]} />
                <meshBasicMaterial
                  color="#9db7ff"
                  transparent
                  opacity={0.08}
                  side={2}
                />
              </mesh>
            </group>
          ))}
          {nodePositions.map((posA, i) =>
            nodePositions.slice(i + 1).map((posB, j) => {
              const dist = Math.sqrt(
                Math.pow(posA[0] - posB[0], 2) +
                Math.pow(posA[1] - posB[1], 2) +
                Math.pow(posA[2] - posB[2], 2)
              );
              if (dist < 3.2) {
                const mid = [(posA[0] + posB[0]) / 2, (posA[1] + posB[1]) / 2, (posA[2] + posB[2]) / 2] as [number, number, number];
                const len = dist;
                return (
                  <mesh key={`${i}-${j}`} position={mid} rotation={[
                    Math.acos((posB[1] - posA[1]) / len),
                    0,
                    Math.atan2(posB[0] - posA[0], posB[2] - posA[2])
                  ] as [number, number, number]}>
                    <cylinderGeometry args={[0.015, 0.015, len, 6]} />
                    <meshBasicMaterial
                      color="#9db7ff"
                      transparent
                      opacity={0.12}
                    />
                  </mesh>
                );
              }
              return null;
            })
          )}
        </group>
      </Canvas>
      <p style={{ marginTop: 16, textAlign: "center", color: "var(--muted)", fontSize: 13, fontFamily: "var(--font-dm-mono)" }}>
        FYI — Memory OS · Memory nodes / graph · RAG · pgvector · Gemini
      </p>
    </div>
  );
}