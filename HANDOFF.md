# Portfolio V2 — Agent Handoff

## Purpose

This repository is the rebuild of **Tarun Sunil’s portfolio** as a dark/light, Apple Liquid Glass-inspired interactive portfolio. The foundation and the first production interaction pass are complete. It is not meant to be a generic Three.js demo: the interface and readable project story take priority; 3D and motion should support them.

## Repository and run commands

Project root:

```text
outputs/portfolio-v2
```

Run locally on Windows PowerShell:

```powershell
cd C:\Users\tarun\Documents\Codex\2026-07-24\referenced-chatgpt-conversation-this-is-untrusted\outputs\portfolio-v2
npm.cmd run dev
```

Production validation:

```powershell
npm.cmd run build
```

The production build passed after the latest implemented changes.

## Stack

- Next.js 16.2.11, App Router
- React 19 + TypeScript
- GSAP + ScrollTrigger
- Three.js + React Three Fiber + Drei
- CSS-first liquid-glass design system (no Tailwind)

Installed dependencies are in `package.json`. `next.config.ts` pins Turbopack’s project root to avoid a workspace lockfile warning.

## Current implementation

### Layout and theme

Main client component: `components/portfolio.tsx`

- Six navigable scenes: Home, About, Projects, Experience, Skills, Contact.
- Dark/light toggle sets `data-theme` on the document root.
- Desktop floating top navigation.
- Desktop left-side option-wheel navigation synchronized with the currently visible section using `IntersectionObserver`.
- Reduced-motion CSS fallback is included.
- Base styling is in `app/globals.css`.

### Hero

Current hero is a CSS-built, lanyard-style ID card. It has a soft swinging animation but is **not yet** the requested React Three Fiber + Rapier physics lanyard.

The card currently uses an `TS` monogram rather than Tarun’s real photo. The original photo is embedded as a large base64 value in `D:\Code\PORTFOLIO\index.html`; do not paste that data URI into source. Extract it into `public/images/tarun.jpg` and replace the CSS monogram only if the user wants this done.

### Content already integrated

The original portfolio source was read from:

```text
D:\Code\PORTFOLIO\index.html
```

The new site contains real content, including:

- Tarun Sunil — Chennai, India; available for full-time roles.
- B.Tech CSE, SRM IST Ramapuram, class of 2026; CGPA 9.14/10.
- Accenture Data Engineering Intern, Dec 2025–May 2026.
- Botcode Technologies Software Developer Intern / HealthPilot, Jul–Dec 2025.
- 18 data-quality checks, 12 governed Delta tables, and 30% API latency reduction.
- Contact: `tarunsunil73@gmail.com`, LinkedIn, GitHub.

### Project gallery

The projects section is intended to be a scroll-pinned horizontal gallery on desktop, and a regular vertical list on mobile.

Real project thumbnails were copied into:

```text
public/previews/lumenforge.webp
public/previews/fyi.webp
public/previews/databricks.webp
public/previews/travel.webp
public/previews/fitlife.webp
```

Project data and URLs live at the top of `components/portfolio.tsx`.

Current projects:

1. LumenForge — C++ / Qt6 / ONNX / OpenCV
2. FYI — Personal Memory OS — Next.js / pgvector / Gemini
3. Retail Sales Intelligence — Databricks / PySpark / Delta Lake
4. AI Travel Planner — Gemini / Amadeus / Flask
5. Obsidian Fitness — Next.js / FastAPI / Supabase
6. E-Commerce Platform — FastAPI / PostgreSQL / Redis

### Beams background

Component: `components/beams.tsx`

This is a lightweight React Three Fiber implementation inspired by the React Bits **Beams** component supplied by the user. The exact supplied source and integration notes can be found in the Codex attachment:

```text
C:\Users\tarun\.codex\attachments\4b8a7de0-97ae-48fc-bc3b-579b86bc949a\pasted-text.txt
```

The existing implementation creates animated, tilted translucent planes and uses R3F lighting. It accepts no public props yet. If visual fidelity to the supplied React Bits version is critical, replace it with a typed conversion of the full shader component from that attachment. Keep it isolated in `components/beams.tsx` so the rest of the site remains unchanged.

## Known issue to fix first

### Horizontal projects scene initial state is wrong

User report:

> “The scroll horizontally lands and starts with the text/project details being hidden and not shown until the full scroll through is complete and I go back to the projects section.”

The screenshot confirms two separate issues:

1. The `ScrollFloat` heading begins at `opacity: 0` and only becomes visible as its ScrollTrigger progresses. This makes the heading look cut off or hidden on first arrival.
2. The horizontal track can retain or calculate an offset before the Projects scene reaches its intended pinned start position. The first project card should be completely visible before horizontal motion begins.

Relevant code:

- `components/portfolio.tsx`: the `useEffect` beginning around the `projectsRef` / `projectTrackRef` refs.
- `components/scroll-float.tsx`: the `gsap.fromTo()` that starts all `.float-char` elements at zero opacity.
- `app/globals.css`: the final `.projects`, `.projects-heading`, and `.project-track` rules.

### Resolution

This issue is resolved in the current code:

- Projects navigation now uses the `projects-gallery` ScrollTrigger start position instead of calling `scrollIntoView()` on the pinned element.
- The horizontal track is explicitly initialized at `x: 0`.
- ScrollFloat keeps its characters visible while animating their position, so the heading is not hidden on entry.
- Preview rows have a fixed height, keeping each project’s stack, title, description, and action visible in the opening viewport.
- Preview image loads call `ScrollTrigger.refresh()` so gallery measurements remain accurate.

### Historical recommended fix

Do these in order:

1. **Keep the heading visible at rest.**
   - Remove the `opacity: 0` initial state from `ScrollFloat`, or use an entrance animation that does not bind opacity to the entire scroll span.
   - A good alternative is `gsap.from(chars, { yPercent: 35, stagger: 0.02, ... })` with `toggleActions: "play none none reverse"`; do not use `scrub` for this heading.

2. **Reset horizontal state before creating the ScrollTrigger.**
   - Call `gsap.set(track, { x: 0 })` before the tween.
   - Use `xPercent` only for element-relative motion, or use an explicit pixel `x` based on the measured `track.scrollWidth - window.innerWidth + rightGutter`.
   - Set `anticipatePin: 1` on `ScrollTrigger` to minimize the pin jump.

3. **Start pinning after the header and first card are visible.**
   - Current trigger `start: "top top"` pins too aggressively for this layout.
   - Prefer a layout with the Projects heading inside the pin and a `start` near `"top top"`, but calculate an initial vertical viewport that contains heading + first card. Another valid option is separate the heading from the pinned horizontal viewport and use `start: "top 20%"`.

4. **Recalculate after images load.**
   - The gallery width can change when thumbnail images have not finished loading. Use `onLoad={() => ScrollTrigger.refresh()}` on each preview image, or preload them before creating the horizontal tween.

5. **Do not use ScrollSmoother here.**
   - It is not required to solve this layout and would add a second scroll controller. ScrollTrigger alone is the right tool for this pinned horizontal gallery.

Suggested effect shape:

```ts
gsap.set(track, { x: 0 });

const tween = gsap.to(track, {
  x: () => -(track.scrollWidth - window.innerWidth + 100),
  ease: "none",
  scrollTrigger: {
    trigger: section,
    start: "top top",
    end: () => `+=${track.scrollWidth - window.innerWidth + 420}`,
    pin: true,
    scrub: 0.8,
    anticipatePin: 1,
    invalidateOnRefresh: true
  }
});
```

This must be tested in a real browser at desktop width after changing it.

## Background direction requested by user

The user explicitly asked to remove the current generic ambient blob background and use Beams as the background direction.

Current generic background is created by:

```tsx
<div className="ambient" aria-hidden="true"><i /><i /><i /></div>
```

in `components/portfolio.tsx`, with `.ambient` rules in `app/globals.css`.

Next agent should:

- Remove the `ambient` JSX and its blob/gradient CSS.
- Retain Beams for the Projects scene as the primary visual background.
- Decide whether Beams should also be a low-opacity fixed global canvas or remain scene-specific. Recommended: remain scene-specific for performance and visual restraint.
- Keep the background sufficiently dark behind text and project cards; use an overlay gradient if necessary instead of reintroducing blobs.

## Design constraints

Keep:

- Apple VisionOS / Liquid Glass direction.
- Dark and light themes.
- Centered floating glass navigation.
- Left option-wheel navigation on desktop; mobile should remain simplified.
- Real portfolio content and preview images.
- A composed, product-like feeling — not a “Three.js demo.”

Avoid:

- Amber / industrial / cyberpunk treatment.
- Neon overload, spinning cubes, or excessive particles.
- Glass cards everywhere without hierarchy.
- Loading every project as a live iframe. Use image previews by default: they are quicker, stable, and avoid third-party embed/security failures.

## Next milestones

1. Fix and visually test the Projects pin/heading behavior.
2. Remove generic ambient blobs and finalize the Beams treatment.
3. Implement the actual lanyard with React Three Fiber + Rapier, using Tarun’s photo.
4. Add scene-specific project expansion interactions:
   - LumenForge: spatial editor workspace.
   - FYI: memory nodes / graph.
   - Travel: route/globe accent.
   - Databricks: glass analytics objects.
   - Fitness: health-ring inspired elements.
5. Add polished mobile navigation and validate keyboard/reduced-motion behavior.
6. Audit dependencies before deployment. `npm audit` still reports upstream Next-related advisories; do not apply `npm audit fix --force` blindly.

## Useful original assets

Original project preview source directory:

```text
D:\Code\PORTFOLIO\assets\previews
```

Original portfolio HTML (for additional content or the source photo):

```text
D:\Code\PORTFOLIO\index.html
```

## Completion bar

The project is a solid functional visual foundation, not the final immersive portfolio yet.

- Foundation / content integration: complete.
- Static liquid-glass interface: complete.
- Projects preview gallery: implemented and browser-verified, including the pin/initial-state fix above.
- Exact React Bits shader Beams: partially implemented as a lightweight R3F version; full shader conversion is optional.
- Rapier lanyard and deep 3D scenes: not yet implemented.
- Accessibility, mobile polish, performance pass, SEO: not yet finalized.
