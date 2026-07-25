"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function ScrollFloat({ children, className = "" }: { children: string; className?: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  const characters = useMemo(() => children.split(""), [children]);

  useLayoutEffect(() => {
    const context = gsap.context(() => {
      const chars = ref.current?.querySelectorAll(".float-char");
      if (!chars?.length) return;
      gsap.fromTo(chars, { opacity: 0, yPercent: 115, scaleY: 1.8, scaleX: 0.76 }, { opacity: 1, yPercent: 0, scaleY: 1, scaleX: 1, stagger: 0.026, ease: "back.inOut(2)", scrollTrigger: { trigger: ref.current, start: "top bottom-=12%", end: "bottom center", scrub: true } });
    }, ref);
    return () => context.revert();
  }, []);

  return <h2 ref={ref} className={`scroll-float ${className}`}>{characters.map((char, index) => <span className="float-char" key={`${char}-${index}`}>{char === " " ? "\u00a0" : char}</span>)}</h2>;
}
