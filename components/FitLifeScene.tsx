"use client";

import { Canvas, useFrame, extend } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useRef, useState, useEffect } from "react";
import * as THREE from "three";

extend({ Group: THREE.Group });
extend({ Mesh: THREE.Mesh });
extend({ TorusGeometry: THREE.TorusGeometry });
extend({ SphereGeometry: THREE.SphereGeometry });
extend({ AmbientLight: THREE.AmbientLight });
extend({ DirectionalLight: THREE.DirectionalLight });
extend({ MeshStandardMaterial: THREE.MeshStandardMaterial });
extend({ MeshBasicMaterial: THREE.MeshBasicMaterial });

function RingsScene({ ringsRef }: { ringsRef: React.RefObject<THREE.Group | null> }) {
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (ringsRef.current) {
      ringsRef.current.rotation.y = time * 0.05;
      ringsRef.current.rotation.x = Math.sin(time * 0.08) * 0.1;
    }
  });
  return null;
}

export default function FitLifeScene() {
  const [mounted, setMounted] = useState(false);
  const ringsRef = useRef<THREE.Group | null>(null);
  const timeRef = useRef(0);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)" }}>Loading health rings…</div>;

  const ringConfigs = [
    { radius: 1.4, width: 0.12, color: "#00d4aa", progress: 0.85, speed: 0.7, rot: [0, 0, 0] as [number, number, number] },
    { radius: 1.0, width: 0.1, color: "#74b9ff", progress: 0.72, speed: 0.5, rot: [Math.PI / 2, 0, 0] as [number, number, number] },
    { radius: 0.7, width: 0.08, color: "#ffeaa7", progress: 0.91, speed: 0.9, rot: [0, Math.PI / 2, 0] as [number, number, number] },
    { radius: 1.8, width: 0.15, color: "#fd79a8", progress: 0.65, speed: 0.4, rot: [Math.PI / 3, Math.PI / 4, 0] as [number, number, number] },
  ];

  return (
    <div style={{ width: "100%", height: "100%", minHeight: 400 }}>
      <Canvas
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 0, 4], fov: 40 }}
        style={{ width: "100%", height: "100%", display: "block" }}
      >
        <RingsScene ringsRef={ringsRef} />
        <OrbitControls enablePan={false} enableZoom={false} minPolarAngle={0.3} maxPolarAngle={2.3} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[2, 3, 4]} intensity={1.2} />
        <directionalLight position={[-2, 2, -3]} intensity={0.7} color="#fd79a8" />

        <group ref={ringsRef}>
          {ringConfigs.map((cfg, i) => (
            <group key={i} rotation={cfg.rot}>
              <mesh>
                <torusGeometry args={[cfg.radius, cfg.width, 16, 64]} />
                <meshStandardMaterial
                  color="#0d1a2e"
                  metalness={0.1}
                  roughness={0.5}
                  transparent
                  opacity={0.15}
                />
              </mesh>
              <mesh>
                <torusGeometry args={[cfg.radius, cfg.width * 1.1, 16, Math.floor(64 * cfg.progress)]} />
                <meshStandardMaterial
                  color={cfg.color}
                  emissive={cfg.color}
                  emissiveIntensity={0.6}
                  transparent
                  opacity={0.9}
                />
              </mesh>
              <group>
                {Array.from({ length: 8 }).map((_, j) => (
                  <mesh key={j} position={[
                    Math.cos((j / 8) * Math.PI * 2) * (cfg.radius + cfg.width),
                    Math.sin((j / 8) * Math.PI * 2) * (cfg.radius + cfg.width),
                    0
                  ] as [number, number, number]}>
                    <sphereGeometry args={[0.04, 8, 8]} />
                    <meshStandardMaterial
                      color={cfg.color}
                      emissive={cfg.color}
                      emissiveIntensity={0.8}
                    />
                  </mesh>
                ))}
              </group>
            </group>
          ))}
        </group>

        <group position={[0, 0, 0]}>
          <mesh>
            <sphereGeometry args={[0.3, 24, 24]} />
            <meshStandardMaterial
              color="#0d1a2e"
              metalness={0.2}
              roughness={0.4}
            />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.35, 24, 24]} />
            <meshBasicMaterial
              color="#00d4aa"
              transparent
              opacity={0.2}
            />
          </mesh>
        </group>
      </Canvas>
      <p style={{ marginTop: 16, textAlign: "center", color: "var(--muted)", fontSize: 13, fontFamily: "var(--font-dm-mono)" }}>
        FitLife · Health-ring inspired elements · Next.js · FastAPI · Supabase
      </p>
    </div>
  );
}