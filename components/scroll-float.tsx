"use client";

import { Fragment, useLayoutEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import usePrefersReducedMotion from "./use-reduced-motion";

gsap.registerPlugin(ScrollTrigger);

export default function ScrollFloat({ children, className = "" }: { children: string; className?: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  const words = useMemo(() => children.split(" "), [children]);
  const reducedMotion = usePrefersReducedMotion();

  useLayoutEffect(() => {
    if (reducedMotion) return;
    const context = gsap.context(() => {
      const chars = ref.current?.querySelectorAll(".float-char");
      if (!chars?.length) return;
      gsap.fromTo(chars, { opacity: 1, yPercent: 24, scaleY: 1.08, scaleX: 0.96 }, { opacity: 1, yPercent: 0, scaleY: 1, scaleX: 1, stagger: 0.026, ease: "back.inOut(2)", scrollTrigger: { trigger: ref.current, start: "top bottom-=12%", end: "bottom center", scrub: true } });
    }, ref);
    return () => context.revert();
  }, [reducedMotion]);

  return (
    <h2 ref={ref} className={`scroll-float ${className}`} aria-label={children}>
      {words.map((word, wordIndex) => (
        <Fragment key={`${word}-${wordIndex}`}>
          <span className="float-word" aria-hidden="true">
            {Array.from(word).map((char, charIndex) => (
              <span className="float-char" key={`${char}-${charIndex}`}>{char}</span>
            ))}
          </span>
          {wordIndex < words.length - 1 ? <span aria-hidden="true"> </span> : null}
        </Fragment>
      ))}
    </h2>
  );
}
