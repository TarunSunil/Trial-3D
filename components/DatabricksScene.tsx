"use client";

import { Canvas, useFrame, extend } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useRef, useState, useEffect } from "react";
import * as THREE from "three";

extend({ Group: THREE.Group });
extend({ Mesh: THREE.Mesh });
extend({ BoxGeometry: THREE.BoxGeometry });
extend({ PlaneGeometry: THREE.PlaneGeometry });
extend({ CylinderGeometry: THREE.CylinderGeometry });
extend({ TorusGeometry: THREE.TorusGeometry });
extend({ GridHelper: THREE.GridHelper });
extend({ AmbientLight: THREE.AmbientLight });
extend({ DirectionalLight: THREE.DirectionalLight });
extend({ MeshStandardMaterial: THREE.MeshStandardMaterial });

function AnalyticsScene({ sceneRef, chartsRef }: { sceneRef: React.RefObject<THREE.Group | null>; chartsRef: React.RefObject<THREE.Mesh[]> }) {
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (sceneRef.current) {
      sceneRef.current.rotation.y = Math.sin(time * 0.06) * 0.12;
    }
    chartsRef.current.forEach((chart, i) => {
      const phase = (i / chartsRef.current.length) * Math.PI * 2;
      const h = 0.6 + Math.sin(time * 1.5 + phase) * 0.35;
      chart.scale.y = h;
      const mat = chart.material as THREE.MeshStandardMaterial;
      if (mat) {
        mat.emissiveIntensity = 0.3 + Math.sin(time * 2 + phase) * 0.2;
      }
    });
  });
  return null;
}

export default function DatabricksScene() {
  const [mounted, setMounted] = useState(false);
  const sceneRef = useRef<THREE.Group | null>(null);
  const chartsRef = useRef<THREE.Mesh[]>([]);
  const timeRef = useRef(0);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)" }}>Loading analytics…</div>;

  const positions = [0, 2, -2].flatMap((x) => [0, 2, -2].map((z) => [x, z]));

  return (
    <div style={{ width: "100%", height: "100%", minHeight: 400 }}>
      <Canvas
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 2, 5], fov: 35 }}
        style={{ width: "100%", height: "100%", display: "block" }}
      >
        <AnalyticsScene sceneRef={sceneRef} chartsRef={chartsRef} />
        <OrbitControls enablePan={false} enableZoom={false} minPolarAngle={0.3} maxPolarAngle={2.3} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[4, 6, 3]} intensity={1.4} castShadow />
        <directionalLight position={[-3, 4, -2]} intensity={0.8} color="#9db7ff" />

        <group ref={sceneRef}>
          <mesh position={[0, -0.1, 0]} receiveShadow>
            <planeGeometry args={[6, 6]} />
            <meshStandardMaterial color="#080c14" metalness={0.05} roughness={0.9} />
          </mesh>

          <gridHelper args={[6, 12, "#1a2a4a", "#0d1a3a"]} position={[0, -0.05, 0]} />

          {positions.map(([x, z]) => (
            <group key={`${x}-${z}`} position={[x, 0, z]}>
              <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
                <boxGeometry args={[1.2, 0.1, 1.2]} />
                <meshStandardMaterial
                  color="#0a1a2e"
                  metalness={0.2}
                  roughness={0.3}
                  transparent
                  opacity={0.8}
                />
              </mesh>
              <mesh position={[0, 1.1, 0]} castShadow ref={(r) => { if (r) chartsRef.current.push(r); }}>
                <boxGeometry args={[0.9, 1.4, 0.9]} />
                <meshStandardMaterial
                  color="#1a3a5c"
                  metalness={0.1}
                  roughness={0.2}
                  transparent
                  opacity={0.7}
                  emissive="#9db7ff"
                  emissiveIntensity={0.3}
                />
              </mesh>
              <mesh position={[0, 1.9, 0]} castShadow>
                <boxGeometry args={[0.6, 0.1, 0.6]} />
                <meshStandardMaterial
                  color="#0d1a2e"
                  metalness={0.3}
                  roughness={0.2}
                  transparent
                  opacity={0.6}
                />
              </mesh>
            </group>
          ))}

          <group position={[-2, 1.2, -2]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.5, 0.5, 1.8, 32]} />
              <meshStandardMaterial
                color="#0d1a2e"
                metalness={0.15}
                roughness={0.25}
                transparent
                opacity={0.6}
              />
            </mesh>
            <mesh position={[0, 1.0, 0]} castShadow>
              <cylinderGeometry args={[0.4, 0.4, 0.1, 32]} />
              <meshStandardMaterial
                color="#9db7ff"
                emissive="#9db7ff"
                emissiveIntensity={0.5}
                transparent
                opacity={0.8}
              />
            </mesh>
          </group>

          <group position={[2, 1.2, 2]}>
            <mesh castShadow>
              <torusGeometry args={[0.6, 0.15, 16, 32]} />
              <meshStandardMaterial
                color="#1a3a5c"
                metalness={0.2}
                roughness={0.3}
                transparent
                opacity={0.7}
                emissive="#9db7ff"
                emissiveIntensity={0.2}
              />
            </mesh>
          </group>
        </group>
      </Canvas>
      <p style={{ marginTop: 16, textAlign: "center", color: "var(--muted)", fontSize: 13, fontFamily: "var(--font-dm-mono)" }}>
        Retail Intelligence (Databricks) · Glass analytics objects · Databricks · PySpark · Delta Lake
      </p>
    </div>
  );
}