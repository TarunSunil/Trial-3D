# AGENTS.md

Single-page Next.js 16 portfolio (App Router, React 19, GSAP, React Three Fiber). No test suite, no CI.

## Commands

- `npm run lint` → `tsc --noEmit`. This is the only lint/typecheck. **`next lint` does not exist in Next 16 — don't call it or "fix" the script.**
- `npm run build` → `next build` (static: `/`, `/_not-found`, `/icon.svg`).
- `npm run dev` / `npm run start` → port 3000.
- Verify order: `npm run lint` → `npm run build`. There are no tests to run.

## Architecture

- `app/page.tsx` renders `components/portfolio.tsx` — **all sections (hero, about, projects, experience, skills, contact) live in that one file**. Section content/`projects` array is data at the top of it.
- Helpers: `components/scroll-float.tsx` (split-text heading anim), `components/beams.tsx` (R3F light-beam canvas), `components/use-reduced-motion.ts` (shared `matchMedia` hook).
- Nearly all styling is in `app/globals.css` (one file; theming, layout, responsive, reduced-motion).
- Fonts: `next/font/google` in `app/layout.tsx` → CSS vars `--font-manrope`, `--font-dm-mono`, `--font-instrument-serif`. **Never add `@import url(...)` to globals.css.**

## Dependencies

Never add a new npm dependency without asking the user first. `@react-three/rapier` is the current pending case (needed for the R3F + Rapier lanyard) — ask before installing it.

## Theme (easy to break)

- Inline pre-paint `<script>` in `layout.tsx` sets `document.documentElement.dataset.theme` (`localStorage.theme` ?? `prefers-color-scheme`) before hydration; `html` uses `suppressHydrationWarning`.
- All theming = CSS vars under `:root[data-theme="light"]` in `globals.css`. Don't hardcode colors for theme branches.
- `portfolio.tsx` hydrates its `theme` state from `dataset.theme` via a `themeHydrated` ref — React state is NOT authoritative on first render; don't seed it from a guess.
- `<Beams theme={...}>` sets the WebGL clear color: light `#dde5f1`, dark `#090b13` (light value was user-confirmed — don't "simplify" it back to the body color).

## Visual / design constraints

Direction: Apple Liquid Glass — dark and light themes, centered floating glass nav, left option-wheel on desktop (simplified on mobile), real content and preview images, a composed product-like feel.

Avoid: amber/industrial/cyberpunk treatment; neon, spinning cubes, or excessive particles; glass cards everywhere without hierarchy; live iframes for project previews (image previews only).

Never fabricate project details, job duties, or content not already in `components/portfolio.tsx`.

### Liquid glass must read as 3D, not flat frosted panels

Every `.glass` surface (topbar, option-wheel, project-details panel, etc.) needs real depth cues, not just `backdrop-filter: blur()`:

- **Layered elevation shadow** — two stacked `box-shadow`s per surface: a tight, low-opacity shadow close in (grounds it against the page) plus a larger, softer, more diffuse shadow further out (lifts it). A single flat shadow reads as flat, not glass.
- **Specular top edge** — a thin, brighter inset highlight along the upper edge (e.g. `inset 0 1px 0 rgba(255,255,255,.4)` in dark theme, a dimmer equivalent in light) so it looks like light is catching the glass's rim.
- **Interactive depth response** — on hover/press, intensify or shift the shadow (not just a background/opacity tween) so the surface visibly lifts or presses — that's what sells "3D object" over "static translucent image." Animate only `transform`/`opacity`/`box-shadow`, nothing layout-affecting.
- Stays CSS-only — no new dependency, no per-frame JS. `backdrop-filter` stays scoped to fixed/sticky elements only; don't extend it to anything inside a scrolling container (perf cost).

## GSAP / pinned gallery

- Projects section is a ScrollTrigger-pinned horizontal track. `next/image` previews use `loading="eager"` + tight `sizes` so cards aren't blank during scrub; `onLoadingComplete` calls `ScrollTrigger.refresh()`.
- Under `prefers-reduced-motion`, the pin is skipped and `.project-track` becomes horizontally scrollable. Any new motion must gate on `usePrefersReducedMotion()`.

## Git hygiene (intentional — don't undo)

- `.gitignore` intentionally excludes `.agents/`, `.codex/`, `.impeccable/`, `skills-lock.json`, `HANDOFF.md`, `session_handoff.md`, `*.log`. These exist on disk; keep them untracked. `git ls-files` should list only source + assets.
- Don't commit unless explicitly asked.

## Content constraints (user-enforced)

- Never invent external facts: no fabricated `metadataBase`/domain, no invented job duties, no guessed URLs.
- Verified content facts: role effective `Aug '26` (Associate Software Engineer, Accenture); LumenForge repo `https://github.com/TarunSunil/photoshop`; FitLife live URL `https://fit-life-indol.vercel.app/`; middle-dot title separator; only 2 `<em>` accents (hero "move", contact "worth remembering").

## QA gotchas

- After changing CSS/build output: **kill the process on port 3000, rebuild, restart** before trusting browser checks. A stale `next start` has served an old CSS manifest and caused phantom layout results.
- `npm audit` should stay at 0 vulnerabilities (deps were bumped to `next ^16.3.5`).
- Design QA: impeccable skill scripts (`detect.mjs`, `hook.mjs`) are wired via `.codex/hooks.json`; global skill lives at `C:\Users\tarun\.agents\skills\impeccable`.

## Open work

See `TASKS.md` for the current task list. Update or remove entries there as work completes — don't duplicate task content into this file.
