"use client";

import { Canvas, useFrame, extend } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useRef, useState, useEffect } from "react";
import * as THREE from "three";

extend({ GridHelper: THREE.GridHelper });
extend({ Mesh: THREE.Mesh });
extend({ BoxGeometry: THREE.BoxGeometry });
extend({ PlaneGeometry: THREE.PlaneGeometry });
extend({ CylinderGeometry: THREE.CylinderGeometry });
extend({ SphereGeometry: THREE.SphereGeometry });
extend({ RingGeometry: THREE.RingGeometry });
extend({ Group: THREE.Group });
extend({ AmbientLight: THREE.AmbientLight });
extend({ DirectionalLight: THREE.DirectionalLight });

function EditorScene({ editorRef }: { editorRef: React.RefObject<THREE.Group | null> }) {
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (editorRef.current) {
      editorRef.current.rotation.y = Math.sin(time * 0.15) * 0.12;
      editorRef.current.rotation.x = Math.cos(time * 0.1) * 0.08;
    }
  });
  return null;
}

export default function LumenForgeScene() {
  const [mounted, setMounted] = useState(false);
  const editorRef = useRef<THREE.Group | null>(null);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)" }}>Loading editor workspace…</div>;

  return (
    <div style={{ width: "100%", height: "100%", minHeight: 400 }}>
      <Canvas
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 1.2, 4.5], fov: 40 }}
        style={{ width: "100%", height: "100%", display: "block" }}
      >
        <EditorScene editorRef={editorRef} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 5, 4]} intensity={1.5} castShadow />
        <directionalLight position={[-2, 3, 2]} intensity={0.8} />

        <OrbitControls enablePan={false} enableZoom={false} minPolarAngle={0.4} maxPolarAngle={2.2} />

        <group ref={editorRef}>
          <gridHelper args={[8, 8, "#9db7ff", "#9db7ff"]} position={[0, -0.02, 0]} />
          <mesh position={[-2.2, 0.6, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.6, 1.1, 0.15]} />
            <meshStandardMaterial color="#1a1d2e" metalness={0.2} roughness={0.4} />
          </mesh>
          <mesh position={[-2.2, 1.2, 0.08]} castShadow>
            <planeGeometry args={[1.4, 0.85]} />
            <meshBasicMaterial color="#0d1117" transparent opacity={0.9} />
          </mesh>
          <group position={[-2.2, 1.2, 0.15]}>
            <mesh position={[-0.5, 0.3, 0]} scale={0.08}>
              <boxGeometry args={[0.8, 0.06, 0.02]} />
              <meshStandardMaterial color="#9db7ff" emissive="#9db7ff" emissiveIntensity={0.4} />
            </mesh>
            <mesh position={[-0.5, 0.15, 0]} scale={0.08}>
              <boxGeometry args={[1.0, 0.06, 0.02]} />
              <meshStandardMaterial color="#9db7ff" emissive="#9db7ff" emissiveIntensity={0.3} />
            </mesh>
            <mesh position={[-0.5, 0, 0]} scale={0.08}>
              <boxGeometry args={[0.7, 0.06, 0.02]} />
              <meshStandardMaterial color="#9db7ff" emissive="#9db7ff" emissiveIntensity={0.2} />
            </mesh>
            <mesh position={[-0.5, -0.15, 0]} scale={0.08}>
              <boxGeometry args={[0.9, 0.06, 0.02]} />
              <meshStandardMaterial color="#9db7ff" emissive="#9db7ff" emissiveIntensity={0.4} />
            </mesh>
            <mesh position={[-0.5, -0.3, 0]} scale={0.08}>
              <boxGeometry args={[0.6, 0.06, 0.02]} />
              <meshStandardMaterial color="#9db7ff" emissive="#9db7ff" emissiveIntensity={0.2} />
            </mesh>
          </group>

          <mesh position={[2, 0.5, -0.5]} castShadow receiveShadow>
            <cylinderGeometry args={[0.35, 0.35, 1.0, 16]} />
            <meshStandardMaterial color="#2d3a5a" metalness={0.5} roughness={0.3} />
          </mesh>
          <mesh position={[2, 1.15, -0.5]} castShadow>
            <sphereGeometry args={[0.38, 16, 16]} />
            <meshStandardMaterial color="#9db7ff" emissive="#9db7ff" emissiveIntensity={0.6} transparent opacity={0.8} />
          </mesh>
          <group position={[2, 1.15, -0.5]}>
            <mesh>
              <ringGeometry args={[0.25, 0.5, 32]} />
              <meshStandardMaterial color="#9db7ff" side={2} transparent opacity={0.4} />
            </mesh>
          </group>

          <mesh position={[-2.2, 0.4, 1.8]} castShadow receiveShadow>
            <boxGeometry args={[0.5, 0.7, 0.5]} />
            <meshStandardMaterial color="#1a1d2e" metalness={0.2} roughness={0.4} />
          </mesh>
          <mesh position={[-2.2, 0.75, 1.95]} castShadow>
            <planeGeometry args={[0.35, 0.25]} />
            <meshBasicMaterial color="#0d1117" />
          </mesh>

          <mesh position={[0, 0.3, -1.8]} castShadow receiveShadow>
            <boxGeometry args={[1.2, 0.5, 0.8]} />
            <meshStandardMaterial color="#1a1d2e" metalness={0.2} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.55, -1.7]} castShadow>
            <planeGeometry args={[0.9, 0.35]} />
            <meshBasicMaterial color="#0d1117" />
          </mesh>
          <group position={[0, 0.55, -1.65]}>
            <mesh position={[-0.3, 0.1, 0]} scale={0.06}>
              <boxGeometry args={[0.6, 0.04, 0.01]} />
              <meshStandardMaterial color="#9db7ff" />
            </mesh>
            <mesh position={[0.3, -0.1, 0]} scale={0.06}>
              <boxGeometry args={[0.5, 0.04, 0.01]} />
              <meshStandardMaterial color="#9db7ff" />
            </mesh>
          </group>

          <group position={[-1.5, 1.8, 0]}>
            <mesh position={[-0.4, 0, 0]} scale={0.05}>
              <boxGeometry args={[0.5, 0.04, 0.01]} />
              <meshStandardMaterial color="#ff6b6b" emissive="#ff6b6b" emissiveIntensity={0.5} />
            </mesh>
            <mesh position={[0, 0, 0]} scale={0.05}>
              <boxGeometry args={[0.7, 0.04, 0.01]} />
              <meshStandardMaterial color="#ff6b6b" emissive="#ff6b6b" emissiveIntensity={0.4} />
            </mesh>
            <mesh position={[0.4, 0, 0]} scale={0.05}>
              <boxGeometry args={[0.4, 0.04, 0.01]} />
              <meshStandardMaterial color="#ff6b6b" emissive="#ff6b6b" emissiveIntensity={0.6} />
            </mesh>
          </group>
        </group>
      </Canvas>
      <p style={{ marginTop: 16, textAlign: "center", color: "var(--muted)", fontSize: 13, fontFamily: "var(--font-dm-mono)" }}>
        LumenForge · Spatial editor workspace · ONNX inference pipeline
      </p>
    </div>
  );
}