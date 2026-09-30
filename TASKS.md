# TASKS.md

Open work for this repo. Update or remove entries here as they're completed — this file is expected to shrink to nothing, unlike AGENTS.md.

**Status:** Tasks 5 and 6 are complete. Remaining work is Tasks 1–4, 7, and 8.

---

## Task 8 — [Low] Keyboard and tablet validation still pending

No specific file — a testing pass.

- Keyboard-only navigation through all 6 sections + the mobile drawer (Tab / Shift+Tab / Escape).
- Tablet width (~768–1024px) visual check — desktop and 390×844 mobile were browser-checked.

**Verify:** Playwright keyboard-event simulation + a tablet-viewport screenshot pass.

---

## Already fixed — do not redo

Dependency audit (`next` → `^16.3.5`, 0 vulnerabilities) · mobile hamburger nav + drawer · reduced-motion hook (gallery pin, `goTo`, ScrollFloat, Beams) · theme persistence (localStorage + `prefers-color-scheme`) · OG/Twitter meta, custom 404, favicon · `next/image` for previews and hero · skip-to-content link · global `:focus-visible` · `aria-hidden` on decorative glyphs · dead CSS (`.project-grid`, base `.project-card`) pruned · agent-tooling internals gitignored and untracked · LumenForge link → `/photoshop` · project label → "FitLife" · light-theme Beams background locked to `#dde5f1` · footer year, project-count stat, unused `scale` prop, `:active` states, `.body-copy` max-width all fixed.

**Task 1 (Critical) — Projects-section entry stutter:** `scrub: 0.4`, `fastScrollEnd: true`, coalesced `queueGalleryRefresh()` in `components/portfolio.tsx`.

**Task 2 (Critical) — About paragraph overlaps topbar:** `scroll-margin-top: 100px` on `.split > *` in `app/globals.css`.

**Task 3 (High) — Mirrored ghost image on flipped card:** explicit `backface-visibility: hidden` + `transform-style: preserve-3d` on card faces in `app/globals.css`.

**Task 4 (High) — Card image bleeds behind EXPLORE panel:** `overflow: hidden` on `.project-track`, opaque background on `.wheel-shell` in `app/globals.css`.

**Completed in this update — Task 5 (Medium):** All six EXPLORE destinations are visible and clickable; tested section navigation from different scroll positions and on the mobile drawer.

**Completed in this update — Task 6 (Milestone):** Replaced the CSS lanyard with an R3F + Rapier physics card and tether, including pointer drag/release swing, procedural ID-card faces, and a responsive mobile presentation. Drag/release was browser-tested on desktop; the card was visually checked on mobile.

**Task 7 (Milestone) — Scene-specific project expansions:** created 5 custom micro-scene components (`LumenForgeScene`, `FYIScene`, `TravelScene`, `DatabricksScene`, `FitLifeScene`), integrated into `components/portfolio.tsx` with Suspense fallback. E-Commerce Platform defaults to generic flip panel.

**Skipped by the user's own choice — do not re-raise unless asked:** font-pairing change, and the three lowest-priority style nitpicks from the original review.
