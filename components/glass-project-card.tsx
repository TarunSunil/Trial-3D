"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Html, Lightformer, MeshTransmissionMaterial, PresentationControls, RoundedBox, View } from "@react-three/drei";
import { gsap } from "gsap";
import { Group } from "three";

type ProjectInfo = {
  name: string;
  description: string;
  tag: string;
  href: string;
};

type GlassProjectCardProps = {
  project: ProjectInfo;
  webglAvailable: boolean;
  visible: boolean;
  reducedMotion: boolean;
  flipped: boolean;
  onFlip: () => void;
};

function ViewInvalidator() {
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    const refreshView = () => invalidate();
    window.addEventListener("scroll", refreshView, { passive: true });
    window.addEventListener("resize", refreshView);
    return () => {
      window.removeEventListener("scroll", refreshView);
      window.removeEventListener("resize", refreshView);
    };
  }, [invalidate]);

  return null;
}

function GlassProjectScene({ project, visible, reducedMotion, flipped, onFlip, cardRef, onCardPointerDown, onCardPointerMove, onCardPointerUp }: Omit<GlassProjectCardProps, "webglAvailable"> & {
  cardRef: React.RefObject<HTMLElement | null>;
  onCardPointerDown: (event: React.PointerEvent<HTMLElement>) => void;
  onCardPointerMove: (event: React.PointerEvent<HTMLElement>) => void;
  onCardPointerUp: () => void;
}) {
  const floatRef = useRef<Group>(null);
  const flipRef = useRef<Group>(null);
  const frontRef = useRef<HTMLButtonElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const [visibleBack, setVisibleBack] = useState(false);
  const invalidate = useThree((state) => state.invalidate);
  const size = useThree((state) => state.size);
  const viewport = useThree((state) => state.viewport);
  const distanceFactor = 400 * viewport.width / size.width;
  const slabWidth = viewport.width * 0.96;
  const slabHeight = viewport.height * 0.94;
  const htmlPortalRef = cardRef as React.RefObject<HTMLElement>;

  useFrame(({ clock }) => {
    if (!floatRef.current) return;
    floatRef.current.position.y = visible && !reducedMotion ? Math.sin(clock.elapsedTime * 1.1) * 0.035 : 0;
    if (visible && !reducedMotion) invalidate();
  });

  useEffect(() => {
    if (!flipRef.current) return;
    gsap.killTweensOf(flipRef.current.rotation);
    const rotation = { y: flipRef.current.rotation.y };
    const target = flipped ? Math.PI : 0;
    const updateFaces = (angle: number) => {
      const progress = Math.max(0, Math.min(1, Math.abs(angle) / Math.PI));
      const linearFade = Math.max(0, Math.min(1, (progress - 0.38) / 0.24));
      const backOpacity = linearFade * linearFade * (3 - 2 * linearFade);
      if (frontRef.current) {
        frontRef.current.style.opacity = String(1 - backOpacity);
        frontRef.current.style.pointerEvents = progress < 0.5 ? "auto" : "none";
      }
      if (backRef.current) {
        backRef.current.style.opacity = String(backOpacity);
        backRef.current.style.pointerEvents = progress >= 0.5 ? "auto" : "none";
      }
    };
    if (reducedMotion) {
      flipRef.current.rotation.y = target;
      updateFaces(target);
      setVisibleBack(flipped);
      invalidate();
      return;
    }
    gsap.to(rotation, {
      y: target,
      duration: 0.72,
      ease: "power3.inOut",
      onUpdate: () => {
        if (!flipRef.current) return;
        flipRef.current.rotation.y = rotation.y;
        updateFaces(rotation.y);
        invalidate();
      },
      onComplete: () => {
        setVisibleBack(flipped);
        invalidate();
      }
    });
    return () => gsap.killTweensOf(rotation);
  }, [flipped, reducedMotion, invalidate]);

  return (
    <>
      <Environment resolution={64}>
        <Lightformer form="rect" intensity={2.1} position={[0, 2.5, 3]} scale={[7, 3, 1]} />
        <Lightformer form="rect" intensity={1.2} position={[-3, 0, -2]} rotation={[0, Math.PI / 4, 0]} scale={[3, 5, 1]} />
      </Environment>
      <PresentationControls global enabled={!reducedMotion} snap={0.55} speed={1} damping={0.25} polar={[-Infinity, Infinity]}>
        <group ref={floatRef}>
          <group ref={flipRef}>
            <RoundedBox args={[slabWidth, slabHeight, 0.16]} radius={0.085} smoothness={5}>
              <MeshTransmissionMaterial transmission={0.94} roughness={0.16} thickness={0.32} ior={1.22} chromaticAberration={0.018} anisotropicBlur={0.08} resolution={96} samples={4} color="#f5f8ff" />
            </RoundedBox>
            <Html transform distanceFactor={distanceFactor} portal={htmlPortalRef} position={[0, 0, 0.084]}>
              <button ref={frontRef} className="glass-project-face glass-project-front" type="button" style={{ width: size.width, height: size.height }} aria-label={`Show details for ${project.name}`} aria-pressed={flipped} inert={visibleBack} onPointerDown={onCardPointerDown} onPointerMove={onCardPointerMove} onPointerUp={onCardPointerUp} onPointerCancel={onCardPointerUp} onClick={onFlip}>
                <span className="project-orb" aria-hidden="true" />
                <span className="project-info-toggle" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5" /><path d="M12 10.5v5" /><path d="M12 7.5h.01" /></svg></span>
              </button>
            </Html>
            <Html transform distanceFactor={distanceFactor} portal={htmlPortalRef} position={[0, 0, -0.084]} rotation={[0, Math.PI, 0]}>
              <div ref={backRef} className="glass-project-face project-details glass-project-back" style={{ width: size.width, height: size.height }} role="group" aria-label={`${project.name} project details`} inert={!visibleBack} onPointerDown={onCardPointerDown} onPointerMove={onCardPointerMove} onPointerUp={onCardPointerUp} onPointerCancel={onCardPointerUp}>
                <button className="project-info-toggle project-info-close" type="button" onClick={onFlip} aria-label={`Show front of ${project.name}`}>
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 8 8 8M16 8l-8 8" /></svg>
                </button>
                <div className="project-copy">
                  <small>{project.tag}</small>
                  <h3>{project.name}</h3>
                  <p>{project.description}</p>
                  <a href={project.href} target={project.href.startsWith("http") ? "_blank" : undefined} rel={project.href.startsWith("http") ? "noreferrer" : undefined} onClick={(event) => event.stopPropagation()}>View project <span aria-hidden="true">↗</span></a>
                </div>
              </div>
            </Html>
          </group>
        </group>
      </PresentationControls>
    </>
  );
}

function FlatProjectCard({ project, flipped, onFlip }: Pick<GlassProjectCardProps, "project" | "flipped" | "onFlip">) {
  return (
    <article className={`project-card card-1 ${flipped ? "is-flipped" : ""}`}>
      <div className="project-card-inner">
        <div className="project-card-face project-preview">
          <span className="project-orb" />
          <button className="project-info-toggle" type="button" onClick={onFlip} aria-label={`Show details for ${project.name}`} aria-pressed={flipped}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5" /><path d="M12 10.5v5" /><path d="M12 7.5h.01" /></svg>
          </button>
        </div>
        <div className="project-card-face project-details">
          <button className="project-info-toggle project-info-close" type="button" onClick={onFlip} aria-label={`Hide details for ${project.name}`}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 8 8 8M16 8l-8 8" /></svg>
          </button>
          <div className="project-copy">
            <small>{project.tag}</small>
            <h3>{project.name}</h3>
            <p>{project.description}</p>
            <a href={project.href} target={project.href.startsWith("http") ? "_blank" : undefined} rel={project.href.startsWith("http") ? "noreferrer" : undefined}>View project <span aria-hidden="true">↗</span></a>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function GlassProjectCard({ project, webglAvailable, visible, reducedMotion, flipped, onFlip }: GlassProjectCardProps) {
  const cardRef = useRef<HTMLElement>(null);
  const pointerOrigin = useRef<{ x: number; y: number } | null>(null);
  const draggedCard = useRef(false);

  useEffect(() => {
    function trackPointer(event: PointerEvent) {
      const origin = pointerOrigin.current;
      if (origin && Math.hypot(event.clientX - origin.x, event.clientY - origin.y) > 7) draggedCard.current = true;
    }
    function releasePointer() {
      window.setTimeout(() => {
        pointerOrigin.current = null;
        draggedCard.current = false;
      }, 500);
    }
    window.addEventListener("pointermove", trackPointer, { passive: true });
    window.addEventListener("pointerup", releasePointer, { passive: true });
    window.addEventListener("pointercancel", releasePointer, { passive: true });
    return () => {
      window.removeEventListener("pointermove", trackPointer);
      window.removeEventListener("pointerup", releasePointer);
      window.removeEventListener("pointercancel", releasePointer);
    };
  }, []);

  function handlePointerDown(event: React.PointerEvent<HTMLElement>) {
    pointerOrigin.current = { x: event.clientX, y: event.clientY };
    draggedCard.current = false;
  }

  function handlePointerMove(event: React.PointerEvent<HTMLElement>) {
    const origin = pointerOrigin.current;
    if (origin && Math.hypot(event.clientX - origin.x, event.clientY - origin.y) > 7) draggedCard.current = true;
  }

  function handlePointerUp() {
    window.setTimeout(() => {
      pointerOrigin.current = null;
      draggedCard.current = false;
    }, 500);
  }

  function handleFlip() {
    if (draggedCard.current) return;
    onFlip();
  }

  if (!webglAvailable) return <FlatProjectCard project={project} flipped={flipped} onFlip={onFlip} />;

  return (
    <View
      as="article"
      ref={cardRef}
      className="project-card project-glass-card card-1"
      visible={visible}
      aria-label={`Interactive glass card: ${project.name}`}
      data-reduced-motion={reducedMotion}
      data-drag-enabled={!reducedMotion}
      data-bob-enabled={visible && !reducedMotion}
    >
      <ViewInvalidator />
      <GlassProjectScene project={project} visible={visible} reducedMotion={reducedMotion} flipped={flipped} onFlip={handleFlip} cardRef={cardRef} onCardPointerDown={handlePointerDown} onCardPointerMove={handlePointerMove} onCardPointerUp={handlePointerUp} />
    </View>
  );
}
