"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ScrollFloat from "./scroll-float";
import Lanyard from "./lanyard";
import usePrefersReducedMotion from "./use-reduced-motion";

gsap.registerPlugin(ScrollTrigger);

const sections = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "projects", label: "Projects" },
  { id: "experience", label: "Experience" },
  { id: "skills", label: "Skills" },
  { id: "contact", label: "Contact" }
];

type Project = readonly [name: string, description: string, tag: string, href: string, image: string | null];

const projects: Project[] = [
  ["LumenForge", "A native photo editor with an ONNX inference pipeline.", "C++ · Qt6 · ONNX · OpenCV", "https://github.com/TarunSunil/photoshop", "/previews/lumenforge.webp"],
  ["FYI — Memory OS", "A private memory layer with RAG, agents, and nightly consolidation.", "Next.js · pgvector · Gemini", "https://le-mem-inky.vercel.app/", "/previews/fyi.webp"],
  ["Retail Intelligence", "A governed Medallion pipeline and AI/BI dashboard, delivered at Accenture.", "Databricks · PySpark · Delta Lake", "#experience", "/previews/databricks.webp"],
  ["AI Travel Planner", "Intent-led itineraries with live flight data.", "Gemini · Amadeus · Flask", "https://ai-travel-planner-seven-flax.vercel.app/", "/previews/travel.webp"],
  ["FitLife", "A two-stage Gemini-powered fitness PWA.", "Next.js · FastAPI · Supabase", "https://fit-life-indol.vercel.app/", "/previews/fitlife.webp"],
  ["E-Commerce Platform", "A resilient backend commerce foundation.", "FastAPI · PostgreSQL · Redis", "https://github.com/TarunSunil/e-commerce-python", null]
];

export default function Portfolio() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [active, setActive] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [flippedProjects, setFlippedProjects] = useState<number[]>([]);
  const [failedPreviews, setFailedPreviews] = useState<string[]>([]);
  const projectsRef = useRef<HTMLElement>(null);
  const projectTrackRef = useRef<HTMLDivElement>(null);
  const themeHydrated = useRef(false);
  const [year, setYear] = useState<number | null>(null);
  const itemIndex = useMemo(() => sections.findIndex((section) => section.id === active), [active]);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (!themeHydrated.current) {
      themeHydrated.current = true;
      const applied = document.documentElement.dataset.theme;
      if (applied === "light" || applied === "dark") {
        setTheme(applied);
        return;
      }
    }
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { threshold: [0.35, 0.6] }
    );
    sections.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, []);

  const pendingRefresh = useRef(false);
  function queueGalleryRefresh() {
    if (pendingRefresh.current) return;
    pendingRefresh.current = true;
    requestAnimationFrame(() => { ScrollTrigger.refresh(); pendingRefresh.current = false; });
  }

  useEffect(() => {
    const section = projectsRef.current;
    const track = projectTrackRef.current;
    if (!section || !track || reducedMotion || window.matchMedia("(max-width: 900px)").matches) return;
    const context = gsap.context(() => {
      const distance = () => Math.max(0, track.scrollWidth - window.innerWidth + 110);
      gsap.set(track, { x: 0 });
      gsap.to(track, { x: () => -distance(), ease: "none", scrollTrigger: { id: "projects-gallery", trigger: section, start: "top top", end: () => `+=${distance() + window.innerHeight * 0.55}`, pin: true, scrub: 0.4, fastScrollEnd: true, anticipatePin: 1, invalidateOnRefresh: true } });
    }, section);
    return () => context.revert();
  }, [reducedMotion]);

  function goTo(id: string) {
    setMenuOpen(false);
    const behavior: ScrollBehavior = reducedMotion ? "auto" : "smooth";
    const target = document.getElementById(id);
    if (!target) return;

    const topbar = document.querySelector(".topbar");
    const topbarHeight = topbar ? topbar.getBoundingClientRect().height : 0;
    const targetRect = target.getBoundingClientRect();
    const galleryStart = id === "projects" ? ScrollTrigger.getById("projects-gallery")?.start : undefined;
    const offsetTop = galleryStart ?? window.scrollY + targetRect.top - topbarHeight - 16;

    window.scrollTo({ top: offsetTop, behavior });
  }

  function toggleProjectInfo(index: number) {
    setFlippedProjects((current) => current.includes(index) ? current.filter((item) => item !== index) : [...current, index]);
  }

  return (
    <main id="main">
      <a href="#main" className="skip-link">Skip to content</a>
      <header className="topbar glass">
        <a href="#home" className="monogram" aria-label="Tarun Sunil home">TS</a>
        <nav aria-label="Primary navigation">
          {sections.slice(0, 4).map((section) => <button key={section.id} onClick={() => goTo(section.id)} className={active === section.id ? "selected" : ""}>{section.label}</button>)}
        </nav>
        <button className="theme-toggle" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label="Toggle colour theme">
          <span>{theme === "dark" ? "Light" : "Dark"}</span><b aria-hidden="true">{theme === "dark" ? "☼" : "◐"}</b>
        </button>
        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu" aria-expanded={menuOpen} aria-controls="mobile-drawer">
          <span aria-hidden="true">{menuOpen ? "✕" : "☰"}</span>
        </button>
      </header>

      {menuOpen && (
        <div className="mobile-drawer glass" id="mobile-drawer">
          <nav aria-label="Mobile navigation">
            {sections.map((section, index) => (
              <button key={section.id} onClick={() => goTo(section.id)} className={active === section.id ? "selected" : ""}>
                <small>0{index + 1}</small>{section.label}
              </button>
            ))}
          </nav>
        </div>
      )}

      <aside className="wheel-shell glass" aria-label="Section navigator">
        <span className="wheel-caption">Explore</span>
        <div className="option-wheel" style={{ "--active-index": itemIndex } as React.CSSProperties}>
          {sections.map((section, index) => (
            <button key={section.id} onClick={() => goTo(section.id)} className={active === section.id ? "active" : ""} style={{ "--index": index } as React.CSSProperties}>
              <small>0{index + 1}</small>{section.label}
            </button>
          ))}
        </div>
        <span className="wheel-line" style={{ "--active-index": itemIndex } as React.CSSProperties} />
      </aside>

      <section id="home" className="scene hero">
        <div className="hero-copy"><p className="eyebrow">Chennai, India · Associate Software Engineer</p><h1>Systems that<br /><em>move</em> ideas<br />forward.</h1><p className="lede">I’m Tarun Sunil, a Computer Science graduate and AI systems builder. Associate Software Engineer at Accenture, and the builder behind LumenForge.</p><button className="primary" onClick={() => goTo("projects")}>Enter the work <span aria-hidden="true">↘</span></button></div>
        <Lanyard />
        <div className="scroll-cue"><span /> Scroll to explore</div>
      </section>

      <section id="about" className="scene content-scene"><p className="eyebrow">01 / About</p><div className="split"><h2>Engineering that makes complex systems feel legible.</h2><div><p className="body-copy">I’m a B.Tech Computer Science graduate from SRM Institute of Science and Technology, class of 2026. I build backend infrastructure, data engineering, and AI systems that move, transform, and surface information reliably at scale.</p><p className="body-copy">Outside work, I explore creative tools, retrieval systems, and products with measurable outcomes.</p><div className="stat-row"><div><strong>9.14</strong><span>CGPA / 10</span></div><div><strong>18</strong><span>DQ checks</span></div><div><strong>30%</strong><span>latency cut</span></div><div><strong>{String(projects.length).padStart(2, "0")}</strong><span>projects</span></div></div></div></div></section>

      <section id="projects" ref={projectsRef} className="scene projects"><div className="projects-heading"><p className="eyebrow">02 / Selected work</p><ScrollFloat>Built to be explored.</ScrollFloat><p>Scroll sideways through selected products and systems.</p></div><div ref={projectTrackRef} className="project-track">{projects.map(([name, description, tag, href, image], index) => <article className={`project-card card-${index % 4} ${flippedProjects.includes(index) ? "is-flipped" : ""}`} key={name}><div className="project-card-inner"><div className="project-card-face project-preview">{(image && !failedPreviews.includes(name)) ? <Image src={image} alt={`${name} preview`} fill loading="eager" sizes="(max-width: 900px) calc(100vw - 56px), min(64vw, 880px)" onLoadingComplete={queueGalleryRefresh} onError={() => setFailedPreviews((current) => current.includes(name) ? current : [...current, name])} /> : <span className="project-orb" />}<button className="project-info-toggle" type="button" onClick={() => toggleProjectInfo(index)} aria-label={`Show details for ${name}`} aria-pressed={flippedProjects.includes(index)}><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5" /><path d="M12 10.5v5" /><path d="M12 7.5h.01" /></svg></button></div><div className="project-card-face project-details"><button className="project-info-toggle project-info-close" type="button" onClick={() => toggleProjectInfo(index)} aria-label={`Hide details for ${name}`}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 8 8 8M16 8l-8 8" /></svg></button>
            <div className="project-copy">
              <small>{tag}</small>
              <h3>{name}</h3>
              <p>{description}</p>
              <a href={href ?? "#"} target={String(href).startsWith("http") ? "_blank" : undefined} rel={String(href).startsWith("http") ? "noreferrer" : undefined}>View project <span aria-hidden="true">↗</span></a>
            </div>
          </div>
        </div>
      </article>
    )}
  </div>
</section>

      <section id="experience" className="scene content-scene"><p className="eyebrow">03 / Experience</p><h2>A path through systems.</h2><div className="timeline"><article><span>Aug ’26 — Present</span><h3>Associate Software Engineer · Accenture</h3></article><article><span>Dec ’25 — May ’26</span><h3>Data Engineering Intern · Accenture</h3><p>Built a Retail Sales Intelligence Platform on Azure Databricks: 12 governed Delta tables, 18 automated DQ checks with a 100% pass rate, and a six-tile AI/BI dashboard.</p></article><article><span>Jul — Dec ’25</span><h3>Software Developer Intern · Botcode</h3><p>Optimised HealthPilot’s production Flask APIs, cutting response latency by 30%, and integrated a Bangla-to-English speech module for clinical staff.</p></article><article><span>2022 — 2026</span><h3>B.Tech CSE · SRM IST Ramapuram</h3><p>Graduated with a 9.14/10 CGPA, specialising through projects in AI, data, systems, and visual software.</p></article></div></section>

      <section id="skills" className="scene skills"><p className="eyebrow">04 / Capabilities</p><h2>A technical practice with a wide aperture.</h2><div className="chip-cloud">{["Python", "SQL", "TypeScript", "C++", "Next.js", "FastAPI", "Qt6", "RAG", "Gemini", "ONNX", "Databricks", "PySpark", "Delta Lake", "Docker", "Azure", "AWS", "PostgreSQL", "Redis"].map((skill) => <span key={skill}>{skill}</span>)}</div></section>

      <section id="contact" className="scene contact"><div className="contact-orb" /><p className="eyebrow">05 / Contact</p><h2>Let’s build something<br /><em>worth remembering.</em></h2><p className="contact-note">Open to interesting engineering conversations and new opportunities. Based in Chennai and available to relocate.</p><a className="mail-link" href="mailto:tarunsunil73@gmail.com">tarunsunil73@gmail.com <span aria-hidden="true">↗</span></a><footer><span>© {year ?? 2026} Tarun Sunil</span><span><a href="https://linkedin.com/in/tarun-sunil-29b213252" target="_blank" rel="noreferrer">LinkedIn</a> · <a href="https://github.com/TarunSunil" target="_blank" rel="noreferrer">GitHub</a></span></footer></section>
    </main>
  );
}
