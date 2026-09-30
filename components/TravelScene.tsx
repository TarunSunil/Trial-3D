"use client";

import { Canvas, useFrame, extend } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useRef, useState, useEffect } from "react";
import * as THREE from "three";

extend({ Group: THREE.Group });
extend({ Mesh: THREE.Mesh });
extend({ SphereGeometry: THREE.SphereGeometry });
extend({ ConeGeometry: THREE.ConeGeometry });
extend({ CylinderGeometry: THREE.CylinderGeometry });
extend({ CircleGeometry: THREE.CircleGeometry });
extend({ AmbientLight: THREE.AmbientLight });
extend({ DirectionalLight: THREE.DirectionalLight });
extend({ MeshStandardMaterial: THREE.MeshStandardMaterial });
extend({ MeshBasicMaterial: THREE.MeshBasicMaterial });

function RoutesScene({ routesRef }: { routesRef: React.RefObject<THREE.Group | null> }) {
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (routesRef.current) routesRef.current.rotation.y = time * 0.04;
  });
  return null;
}

export default function TravelScene() {
  const [mounted, setMounted] = useState(false);
  const routesRef = useRef<THREE.Group | null>(null);
  const globeRef = useRef<THREE.Group | null>(null);
  const timeRef = useRef(0);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)" }}>Loading globe…</div>;

  const routes: { from: [number, number, number]; to: [number, number, number] }[] = [
    { from: [1.2, 0.5, 0], to: [-0.8, 0.8, 0.5] },
    { from: [-0.5, -0.6, 0.9], to: [0.9, 0.2, -0.7] },
    { from: [0, 0.9, -0.4], to: [-1.1, -0.3, -0.2] },
    { from: [-0.9, 0.3, -0.8], to: [0.6, -0.7, 0.4] },
    { from: [0.7, -0.4, 0.6], to: [-0.3, 0.7, -0.9] },
  ];

  return (
    <div style={{ width: "100%", height: "100%", minHeight: 400 }}>
      <Canvas
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 0.5, 3.5], fov: 40 }}
        style={{ width: "100%", height: "100%", display: "block" }}
      >
        <RoutesScene routesRef={routesRef} />
        <OrbitControls enablePan={false} enableZoom={false} minPolarAngle={0.3} maxPolarAngle={2.3} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[3, 4, 2]} intensity={1.3} castShadow />
        <directionalLight position={[-2, 3, -3]} intensity={0.7} color="#ffeaa7" />

        <group ref={globeRef}>
          <mesh castShadow receiveShadow>
            <sphereGeometry args={[1.3, 48, 48]} />
            <meshStandardMaterial
              color="#0d1a2e"
              metalness={0.1}
              roughness={0.8}
              transparent
              opacity={0.95}
            />
          </mesh>
          <mesh>
            <sphereGeometry args={[1.32, 48, 48]} />
            <meshBasicMaterial
              color="#1a3a5c"
              transparent
              opacity={0.1}
              side={2}
            />
          </mesh>
        </group>

        <group ref={routesRef}>
          {routes.map((route, i) => {
            const mid = [
              (route.from[0] + route.to[0]) / 2,
              (route.from[1] + route.to[1]) / 2 + 0.4,
              (route.from[2] + route.to[2]) / 2
            ] as [number, number, number];
            const len = Math.sqrt(
              Math.pow(route.to[0] - route.from[0], 2) +
              Math.pow(route.to[1] - route.from[1], 2) +
              Math.pow(route.to[2] - route.from[2], 2)
            );
            return (
              <mesh key={i} position={mid} rotation={[
                Math.acos((route.to[1] - route.from[1]) / len),
                0,
                Math.atan2(route.to[0] - route.from[0], route.to[2] - route.from[2])
              ] as [number, number, number]}>
                <cylinderGeometry args={[0.025, 0.025, len * 0.9, 8]} />
                <meshBasicMaterial
                  color="#ffeaa7"
                  transparent
                  opacity={0.6}
                />
              </mesh>
            );
          })}
          {routes.flatMap((route, i) => [
            <mesh key={`pin-from-${i}`} position={route.from} scale={0.08}>
              <coneGeometry args={[0.5, 1.2, 16]} />
              <meshStandardMaterial color="#ffeaa7" emissive="#ffeaa7" emissiveIntensity={0.6} />
            </mesh>,
            <mesh key={`pin-to-${i}`} position={route.to} scale={0.06}>
              <coneGeometry args={[0.5, 1.2, 16]} />
              <meshStandardMaterial color="#74b9ff" emissive="#74b9ff" emissiveIntensity={0.5} />
            </mesh>,
          ])}
        </group>

        <group position={[0, -1.5, 0]}>
          <mesh>
            <circleGeometry args={[1.6, 64]} />
            <meshBasicMaterial color="#0a1a2e" transparent opacity={0.3} side={2} />
          </mesh>
        </group>
      </Canvas>
      <p style={{ marginTop: 16, textAlign: "center", color: "var(--muted)", fontSize: 13, fontFamily: "var(--font-dm-mono)" }}>
        AI Travel Planner · Route / globe accent · Gemini · Amadeus · Flask
      </p>
    </div>
  );
}