'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, extend, useFrame, useThree, type ThreeElement, type ThreeEvent } from '@react-three/fiber';
import { Environment, Lightformer, RoundedBox, useTexture } from '@react-three/drei';
import {
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  useRopeJoint,
  useSphericalJoint,
  type RapierRigidBody,
  type RigidBodyProps
} from '@react-three/rapier';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';
import * as THREE from 'three';
import usePrefersReducedMotion from './use-reduced-motion';
import './Lanyard.css';

extend({ MeshLineGeometry, MeshLineMaterial });

declare module '@react-three/fiber' {
  interface ThreeElements {
    meshLineGeometry: ThreeElement<typeof MeshLineGeometry>;
    meshLineMaterial: ThreeElement<typeof MeshLineMaterial>;
  }
}

type LanyardProps = {
  frontImage?: string | null;
  backImage?: string | null;
  imageFit?: 'cover' | 'contain';
  lanyardWidth?: number;
  className?: string;
};

type LanyardBody = RapierRigidBody & { lerped?: THREE.Vector3 };

const BLANK_PIXEL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

function makeCardTexture(image: THREE.Texture, side: 'front' | 'back', imageFit: 'cover' | 'contain') {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 720;
  const context = canvas.getContext('2d');
  if (!context) return new THREE.CanvasTexture(canvas);

  context.fillStyle = side === 'front' ? '#f4f5f8' : '#e8ecf4';
  context.fillRect(0, 0, canvas.width, canvas.height);
  if (side === 'front') {
    const photoHeight = 470;
    const photo = image.image as CanvasImageSource & { width: number; height: number };
    if (photo.width && photo.height) {
      const scale = imageFit === 'cover'
        ? Math.max(512 / photo.width, photoHeight / photo.height)
        : Math.min(512 / photo.width, photoHeight / photo.height);
      const width = photo.width * scale;
      const height = photo.height * scale;
      context.save();
      context.beginPath();
      context.rect(0, 0, 512, photoHeight);
      context.clip();
      context.drawImage(photo, (512 - width) / 2, (photoHeight - height) / 2, width, height);
      context.restore();
    }
    context.fillStyle = 'rgba(8, 12, 21, .34)';
    context.fillRect(0, 0, 512, photoHeight);
    context.fillStyle = '#ffffff';
    context.font = '600 20px Arial';
    context.fillText('TS / 2026', 36, 48);
    context.textAlign = 'right';
    context.fillText('IDENTITY', 476, 48);
    context.textAlign = 'left';
    context.fillStyle = '#101521';
    context.font = '700 42px Arial';
    context.fillText('Tarun Sunil', 36, 526);
    context.fillStyle = '#303b4e';
    context.font = '700 27px Arial';
    context.fillText('AI Systems Builder', 36, 562);
    context.fillStyle = '#28344a';
    context.font = '700 19px Arial';
    context.fillText('B.TECH CSE  ·  SRM IST', 36, 660);
    context.textAlign = 'right';
    context.fillStyle = '#405fbd';
    context.font = '700 32px Arial';
    context.fillText('TS', 474, 664);
  } else {
    context.fillStyle = '#121722';
    context.fillRect(0, 0, 512, 720);
    context.fillStyle = '#aebde5';
    context.font = '600 18px Arial';
    context.fillText('TARUN SUNIL', 40, 62);
    context.fillStyle = '#f6f7fa';
    context.font = '700 34px Arial';
    context.fillText('Associate Software', 40, 160);
    context.fillText('Engineer', 40, 204);
    context.fillStyle = '#c2c8d4';
    context.font = '500 21px Arial';
    context.fillText('Accenture', 40, 246);
    context.fillStyle = '#343c4e';
    context.fillRect(40, 292, 432, 2);
    context.fillStyle = '#e2e6ee';
    context.font = '500 18px Arial';
    context.fillText('B.Tech Computer Science', 40, 354);
    context.fillText('SRM Institute of Science and Technology', 40, 388);
    context.fillText('Chennai, India', 40, 422);
    context.fillStyle = '#aebde5';
    context.font = '700 64px Arial';
    context.fillText('TS', 40, 650);
    context.fillStyle = '#81899a';
    context.font = '500 15px Arial';
    context.fillText('TARUNSUNIL.DEV', 40, 684);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

function Band({ frontImage, backImage, imageFit, lanyardWidth, reducedMotion, isMobile }: {
  frontImage: string;
  backImage: string | null;
  imageFit: 'cover' | 'contain';
  lanyardWidth: number;
  reducedMotion: boolean;
  isMobile: boolean;
}) {
  const ribbon = useRef<THREE.Mesh<InstanceType<typeof MeshLineGeometry>, InstanceType<typeof MeshLineMaterial>>>(null!);
  const fixed = useRef<RapierRigidBody>(null!);
  const first = useRef<LanyardBody>(null!);
  const second = useRef<LanyardBody>(null!);
  const third = useRef<RapierRigidBody>(null!);
  const card = useRef<RapierRigidBody>(null!);
  const point = useMemo(() => new THREE.Vector3(), []);
  const direction = useMemo(() => new THREE.Vector3(), []);
  const angle = useMemo(() => new THREE.Vector3(), []);
  const rotation = useMemo(() => new THREE.Vector3(), []);
  const dragPosition = useMemo(() => new THREE.Vector3(), []);
  const cardAnchor = useMemo(() => new THREE.Vector3(), []);
  const firstAnchor = useMemo(() => new THREE.Vector3(), []);
  const secondAnchor = useMemo(() => new THREE.Vector3(), []);
  const anchorOffset = useMemo(() => new THREE.Vector3(0, 1.3, 0), []);
  const cardOrientation = useMemo(() => new THREE.Quaternion(), []);
  const viewportWidth = useThree((state) => state.viewport.width);
  const curve = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()
  ]), []);
  const [dragged, setDragged] = useState<false | THREE.Vector3>(false);
  const [hovered, setHovered] = useState(false);
  const frontSource = useTexture(frontImage || BLANK_PIXEL);
  const backSource = useTexture(backImage || BLANK_PIXEL);
  const frontMap = useMemo(() => makeCardTexture(frontSource, 'front', imageFit), [frontSource, imageFit]);
  const backMap = useMemo(() => makeCardTexture(backSource, 'back', imageFit), [backSource, imageFit]);
  const bandMap = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 256;
    const context = canvas.getContext('2d')!;
    context.fillStyle = '#101216';
    context.fillRect(0, 0, 128, 256);
    context.fillStyle = '#2b2e34';
    context.fillRect(0, 0, 11, 256);
    context.fillStyle = '#3b3e44';
    context.fillRect(18, 0, 5, 256);
    context.fillStyle = 'rgba(255,255,255,.55)';
    context.fillRect(32, 0, 3, 256);
    context.fillStyle = '#17191e';
    context.fillRect(44, 0, 72, 256);
    context.fillStyle = '#30333a';
    context.fillRect(116, 0, 12, 256);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }, []);

  const segmentProps: RigidBodyProps = {
    type: 'dynamic', canSleep: true, colliders: false, angularDamping: 4, linearDamping: 4
  };

  const lerped = (body: LanyardBody) => {
    if (!body.lerped) body.lerped = new THREE.Vector3().copy(body.translation());
    return body.lerped;
  };

  useRopeJoint(fixed, first, [[0, 0, 0], [0, 0, 0], 1.05]);
  useRopeJoint(first, second, [[0, 0, 0], [0, 0, 0], 1.05]);
  useRopeJoint(second, third, [[0, 0, 0], [0, 0, 0], 1.05]);
  useSphericalJoint(third, card, [[0, 0, 0], [0, 1.3, 0]]);

  useEffect(() => {
    if (!hovered) return;
    document.body.style.cursor = dragged ? 'grabbing' : 'grab';
    return () => { document.body.style.cursor = ''; };
  }, [hovered, dragged]);

  useEffect(() => () => {
    frontMap.dispose();
    backMap.dispose();
    bandMap.dispose();
  }, [frontMap, backMap, bandMap]);

  useFrame((state, delta) => {
    if (dragged) {
      point.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      direction.copy(point).sub(state.camera.position).normalize();
      point.add(direction.multiplyScalar(state.camera.position.length()));
      dragPosition.set(point.x - dragged.x, point.y - dragged.y, point.z - dragged.z);
      card.current?.setNextKinematicTranslation(dragPosition);
      const currentRotation = card.current?.rotation();
      if (currentRotation) {
        cardOrientation.set(currentRotation.x, currentRotation.y, currentRotation.z, currentRotation.w);
      }
      cardAnchor.copy(anchorOffset).applyQuaternion(cardOrientation).add(dragPosition);
      const fixedPosition = fixed.current.translation();
      firstAnchor.copy(fixedPosition).lerp(cardAnchor, 1 / 3);
      secondAnchor.copy(fixedPosition).lerp(cardAnchor, 2 / 3);
      first.current?.setNextKinematicTranslation(firstAnchor);
      second.current?.setNextKinematicTranslation(secondAnchor);
      third.current?.setNextKinematicTranslation(cardAnchor);
    }
    if (!fixed.current) return;
    [first, second].forEach((body) => {
      const current = body.current;
      if (!current) return;
      if (dragged) {
        lerped(current).copy(current.translation());
        return;
      }
      const smooth = lerped(current);
      const distance = Math.max(0.1, Math.min(1, smooth.distanceTo(current.translation())));
      smooth.lerp(current.translation(), delta * (reducedMotion ? 18 : 50 * distance));
    });
    curve.points[0].copy(third.current.translation());
      curve.points[1].copy(dragged ? second.current.translation() : lerped(second.current));
      curve.points[2].copy(dragged ? first.current.translation() : lerped(first.current));
    curve.points[3].copy(fixed.current.translation());
    ribbon.current.geometry.setPoints(curve.getPoints(24));
    angle.copy(card.current.angvel());
    rotation.copy(card.current.rotation());
    card.current.setAngvel({ x: angle.x, y: angle.y - rotation.y * 0.25, z: angle.z }, true);
  });

  curve.curveType = 'chordal';

  return (
    <>
      <group position={[isMobile ? 0.25 : viewportWidth * 0.25, 3.55, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[0.55, -0.5, 0]} ref={first} {...segmentProps} type={dragged ? 'kinematicPosition' : 'dynamic'}><BallCollider args={[0.1]} /></RigidBody>
        <RigidBody position={[0.55, -1, 0]} ref={second} {...segmentProps} type={dragged ? 'kinematicPosition' : 'dynamic'}><BallCollider args={[0.1]} /></RigidBody>
        <RigidBody position={[0.55, -1.5, 0]} ref={third} {...segmentProps} type={dragged ? 'kinematicPosition' : 'dynamic'}><BallCollider args={[0.1]} /></RigidBody>
        <RigidBody position={[0.55, -2.8, 0]} ref={card} {...segmentProps} type={dragged ? 'kinematicPosition' : 'dynamic'}>
          <CuboidCollider args={[0.98, 1.38, 0.08]} />
          <group
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
            onPointerUp={(event: ThreeEvent<PointerEvent>) => {
              (event.target as Element).releasePointerCapture(event.pointerId);
              if (reducedMotion) {
                card.current?.setLinvel({ x: 0, y: 0, z: 0 }, true);
                card.current?.setAngvel({ x: 0, y: 0, z: 0 }, true);
              }
              setDragged(false);
            }}
            onPointerCancel={() => setDragged(false)}
            onPointerDown={(event: ThreeEvent<PointerEvent>) => {
              event.stopPropagation();
              (event.target as Element).setPointerCapture(event.pointerId);
              setDragged(new THREE.Vector3().copy(event.point).sub(point.copy(card.current!.translation())));
            }}
          >
            <RoundedBox args={[1.96, 2.76, 0.12]} radius={0.14} smoothness={5}>
              <meshPhysicalMaterial color="#f3f5fa" clearcoat={1} clearcoatRoughness={0.16} roughness={0.42} metalness={0.48} />
            </RoundedBox>
            <mesh position={[0, 0, 0.064]}>
              <planeGeometry args={[1.82, 2.62]} />
              <meshPhysicalMaterial map={frontMap} roughness={0.82} metalness={0} clearcoat={0.25} />
            </mesh>
            <mesh position={[0, 0, -0.064]} rotation={[0, Math.PI, 0]}>
              <planeGeometry args={[1.82, 2.62]} />
              <meshPhysicalMaterial map={backMap} roughness={0.82} metalness={0} />
            </mesh>
            <mesh position={[0, 1.46, 0]}>
              <torusGeometry args={[0.22, 0.055, 12, 28]} />
              <meshStandardMaterial color="#c8cbd2" metalness={0.92} roughness={0.24} />
            </mesh>
            <mesh position={[0, 1.34, 0.02]}>
              <boxGeometry args={[0.42, 0.22, 0.12]} />
              <meshStandardMaterial color="#b8bdc7" metalness={0.88} roughness={0.27} />
            </mesh>
          </group>
        </RigidBody>
      </group>
      <mesh ref={ribbon}>
        <meshLineGeometry />
        <meshLineMaterial args={[{ resolution: new THREE.Vector2(1000, 1200) }]} color="#c9cbd0" depthTest={false} resolution={[1000, 1200]} useMap={1} map={bandMap} repeat={[-3, 1]} lineWidth={isMobile ? lanyardWidth : lanyardWidth * 0.52} />
      </mesh>
    </>
  );
}

export default function Lanyard({ frontImage = '/images/tarun.jpg', backImage = null, imageFit = 'cover', lanyardWidth = 0.5, className = '' }: LanyardProps) {
  const reducedMotion = usePrefersReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 900px)');
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  return (
    <div className={`lanyard-wrapper ${className}`}>
      <Canvas camera={{ position: [0, 0, 8.5], fov: isMobile ? 30 : 37 }} dpr={[1, isMobile ? 1.25 : 1.6]} gl={{ alpha: true, antialias: true }}>
        <ambientLight intensity={Math.PI * 0.7} />
        <directionalLight position={[3, 4, 5]} intensity={2.2} />
        <Physics gravity={[0, reducedMotion ? 0 : -18, 0]} timeStep={isMobile ? 1 / 30 : 1 / 60}>
          <Band frontImage={frontImage ?? ''} backImage={backImage} imageFit={imageFit} lanyardWidth={lanyardWidth} reducedMotion={reducedMotion} isMobile={isMobile} />
        </Physics>
        <Environment blur={0.7}>
          <Lightformer intensity={2} color="white" position={[0, -1, 5]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={3} color="white" position={[-1, 1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={5} color="white" position={[5, 1, 0]} rotation={[0, Math.PI / 2, 0]} scale={[100, 10, 1]} />
        </Environment>
      </Canvas>
    </div>
  );
}
