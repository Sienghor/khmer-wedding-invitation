# Phase 5: QA Report

*Run: 2026-11-21, against the production build (`npm run build && npm run preview`).*
*Reproduce: `npm run verify`, then `npm run qa` (writes `qa-output/qa-report.json` and screenshots).*

## Summary

| Area | Result |
|---|---|
| Type check (`tsc --noEmit`) | ✅ pass |
| Heritage policy (`npm run check:heritage`) | ✅ 9 motifs registered, all rendered, all IDs valid, no raster or external ornament assets in 77 source files |
| Runtime motif audit | ✅ 50 ornament elements on the page; 0 unknown motif IDs; **0 non-photo `<img>`; 0 CSS background images** |
| Horizontal overflow | ✅ 0 px at all 8 viewports (opening and main page) |
| Opening fits viewport | ✅ doorway and button fully on-screen at all 8 viewports |
| Opening → invitation | ✅ at all 8 viewports; keyboard (focus lands on the button, Enter opens) ✅ |
| Scroll reveals | ✅ 0 elements left unrevealed after scrolling, at every viewport |
| Touch targets | ✅ 0 interactive elements under 40 px |
| Accessibility (axe-core 4) | ✅ **0 violations** on the opening and on the full main page |
| Reduced motion | ✅ SVG doorway, ready immediately, opens, 0 hidden content |
| RSVP | ✅ guest name pre-filled from `?to=`; submission stored (demo mode); thank-you state |
| Lightbox | ✅ opens; ArrowRight → "2 / 9"; focus held in dialog; Esc closes |
| Calendar | ✅ Google Calendar link; .ics download |
| Assets | ✅ 0 broken images; Moul, Battambang and Cormorant render Khmer/Latin |
| Console | ✅ 0 app errors or warnings (see note on GL driver messages) |

## Viewport matrix

| Viewport | Size | Opening mode | Overflow (gate / main) | Fit | Opened | Unrevealed | Small targets |
|---|---|---|---|---|---|---|---|
| Small phone | 320×568 | 3D | 0 / 0 | ✅ | ✅ | 0 | 0 |
| Phone | 360×740 | 3D | 0 / 0 | ✅ | ✅ | 0 | 0 |
| iPhone | 390×844 | 3D | 0 / 0 | ✅ | ✅ | 0 | 0 |
| Large phone | 430×932 | 3D | 0 / 0 | ✅ | ✅ | 0 | 0 |
| Tablet portrait | 768×1024 | 3D | 0 / 0 | ✅ | ✅ | 0 | 0 |
| Tablet landscape | 1024×768 | 3D | 0 / 0 | ✅ | ✅ | 0 | 0 |
| Desktop | 1440×900 | 3D | 0 / 0 | ✅ | ✅ | 0 | 0 |
| Large desktop | 1920×1080 | 3D | 0 / 0 | ✅ | ✅ | 0 | 0 |

## Performance

| Metric | Value |
|---|---|
| Main JS | 292 kB raw / **92 kB gzip** (React + app) |
| CSS | 43 kB / 9.5 kB gzip |
| 3D chunk | Three.js 144 kB gzip plus doorway 4 kB gzip. **Lazy-loaded only when 3D is used; never in the main bundle.** |
| Fonts | Self-hosted woff2 with `unicode-range` subsets (Khmer and Latin only) |
| 3D draw calls | **15** per frame (the ~150 relief meshes are merged per material) |
| 3D triangles | ~56k |
| 3D frame time | 33 ms median in headless **CPU** WebGL (SwiftShader). This is a pessimistic bound; GPU devices are expected to hold 60 fps but were **not measured**. |
| GPU memory | Scene fully disposed when the opening closes; rendering pauses when the tab is hidden |
| Layout shift | Photo slots reserve their aspect ratio; reveals use transform/opacity only |

## Defects found and fixed during QA

| # | Defect | Fix |
|---|---|---|
| 1 | Story photos never appeared: `IntersectionObserver` ignores fully clipped targets (`clip-path: inset(0 0 100% 0)`) | Clip the child and observe the unclipped wrapper |
| 2 | Opening names appeared before the 3D lintel settled (HTML timers started at mount; the 3D clock started after the lazy chunk loaded) | Phase timers start from the scene's `onReady`; 4 s guard falls back to SVG |
| 3 | 3D gilt shapes rendered white (facing the environment's brightest panel) | Rotated the generated environment; tuned metal roughness |
| 4 | 3D terminal naga fans overhung the lintel block | Terminal moved inward and scaled (layout shared with SVG) |
| 5 | 3D naga eyes read as cartoon faces | Eyes removed in 3D; the raised head layer carries the form (registry note added) |
| 6 | SVG fallback colonnettes shrank, leaving a gap under the lintel | Column box width now derived from the 2D elevation's true aspect |
| 7 | Schedule colonnette spine rendered as a short stub (fixed-aspect SVG cannot stretch) | Replaced with a scroll-grown gilt rule |
| 8 | 18 contrast failures: antique gold small text (3.3:1); placeholders at 62% opacity | `--c-gold-ink` token (≥ 4.5:1); placeholders at full strength, marked by a dashed underline |
| 9 | Accessible name mismatches (gallery tiles, open button) | Visible or visually-hidden text instead of conflicting `aria-label` |
| 10 | No `h1` in the main document | Visually hidden `h1` in `<main>` |
| 11 | Provenance link 22 px tall | 44 px target |
| 12 | Hero names below the fold on desktop and never revealed (bottom 12% excluded by the reveal margin) | Hero sized by viewport height; names animate on mount |
| 13 | Nav light glass looked grey over dark sections | Nav switches to dark glass over details, RSVP and closing |

## Known limitations and notes

- **GL driver messages:** at 320×568 the console showed two Chromium *"GPU stall due to ReadPixels"* performance warnings. They come from the headless SwiftShader driver during screenshot capture; the app never calls `readPixels`.
- **Not tested on physical devices or in Safari or Firefox.** Testing used headless Chromium only. Features with fallbacks: CSS scroll-driven animations (static in Firefox), View Transitions (instant swap where unsupported) and `backdrop-filter` (denser tint fallback). These paths need checking on a real iPhone (Safari) and Android before launch.
- **Reference invitation:** only its landing screen could be inspected (see `01-design-technical-audit.md`).
- **Content:** all wedding facts are placeholders (71 bracketed strings; the date is flagged as a placeholder). Template wording (formal Khmer invitation formula, ceremony names) should be reviewed by the families.
- **RSVP:** demo mode until `wedding.rsvp.endpoint` is set.

## Acceptance criteria

| Criterion | Status |
|---|---|
| Every decorative motif has documented Khmer heritage provenance | ✅ registry with quoted, linked evidence; 7 verified, 2 partially verified (kbach figures sourced to a Wikipedia summary of Bizot) |
| No unverified generic Asian ornamentation | ✅ unverifiable motifs listed under "Researched, not used" |
| No raster image used as ornamentation or architecture | ✅ static and runtime checks |
| All decorative elements rendered through code | ✅ |
| SVG decorative paths authored or generated | ✅ `src/ornaments/geometry` |
| Architectural elements preserve Khmer characteristics | ✅ symmetry, odd naga heads, upward lotus and octagonal colonnettes enforced in code |
| Consistent motion language | ✅ one token set; documented choreography |
| 3D where it adds value | ✅ opening doorway only; lazy, disposed and with a fallback |
| Liquid glass applied selectively | ✅ open button, nav, countdown, RSVP card, lightbox controls |
| Opening and closing complete | ✅ |
| Works on mobile and desktop | ✅ 8 viewports (headless Chromium) |
| Photo skeletons implemented and replaceable | ✅ |
| Wedding information configurable | ✅ `src/config/wedding.ts` |
| No invented couple information or photographs | ✅ all bracketed placeholders; no photos |
| Performance and accessibility tested | ✅ axe 0 violations; bundle and draw-call figures above. ⚠️ No real-device FPS. |
| No major console errors or broken interactions | ✅ |

---

## Revision 2 (2026-11-21): real content, media, more 3D, theme presets

**Changes:** couple and parents' names filled in; map link; 8 photos and 2 clips processed and placed; the hero lintel and the closing temple are now real WebGL scenes; CSS-3D tilt on photos and cards; `burgundy` / `olive` theme presets; explicit Khmer date formatting.

| Check | Result |
|---|---|
| Type check · heritage check (87 files) · build | ✅ |
| 8 viewports: overflow, opening fit, open flow, reveals, touch targets | ✅ all pass |
| axe-core (opening + main) | ✅ 0 violations |
| RSVP · lightbox (8 photos) · calendar · keyboard · reduced motion | ✅ |
| Broken images | ✅ 0 (all 14 photo slots load real WebP) |
| Non-photo `<img>` / CSS background images | ✅ 0 / 0 (blur-up previews inside photo frames are photography) |
| WebGL contexts | ✅ one at a time during the opening (in-page scenes wait until it is opened) |
| Draw calls | doorway 15 · temple 27 |
| Opening frame time (CPU WebGL) | 33 ms median (unchanged) |
| Main JS | 97 kB gzip (+5 kB); three.js and scene hosts stay lazy |

**Defects found and fixed in this round:** hero canvas capped by the global `canvas { max-width: 100% }` reset (lintel clipped on one side); the hero 3D scene rendering behind the opening gate (two WebGL contexts, 50 ms frames); Khmer date showing English names with Khmer digits in browsers without Khmer calendar data; temple scene framed in a visible rectangle (fixed with fog matching and an edge mask); the bride's name stored with ំ before ា.

**Still not done:** testing on physical devices and in Safari or Firefox. The two in-page WebGL scenes are new, so check them on a mid-range Android phone before launch.

---

## Revision 3 (2026-11-22): Banteay Srei identity, olive theme, wedding date

**Changes:**
- Olive is now the published theme.
- Wedding date set to Friday 8 January 2027; the time is still a placeholder (`timeIsPlaceholder`).
- Four new sourced motifs: KH-PED-01 Banteay Srei superposed fronton, KH-VIN-01 foliated scroll, KH-WAL-01 wall tapestry, KH-BAY-01 Bayon face tower.
- Evidence comes from Maurice Glaize, *The Monuments of the Angkor Group* (theangkorguide.com), and Wikipedia (Banteay Srei, Bayon, Angkor Thom).
- The 3D opening doorway now carries the fronton.
- The hero is a Banteay Srei portal; the names sit beside it on desktop.
- The earlier "Banteay Srei pediments: not used" exclusion is withdrawn now that Glaize documents the frame form.

| Check | Result |
|---|---|
| Type check · heritage check (13 motifs, 95 files) · build | ✅ |
| 8 viewports: overflow, opening fit, open flow, reveals, touch targets | ✅ all pass |
| axe-core (opening + main) | ✅ 0 violations |
| Motifs on page | 12 IDs, 57 ornament elements, 0 unknown; 0 non-photo `<img>`; 0 CSS background images |
| Opening frame time (CPU WebGL) | 33.4 ms median, 50.1 ms p95 (p95 up from rev. 2: the fronton adds geometry). The draw-call/triangle figure QA records (15 / 56k) is taken on the first frame, before the fronton appears. |
| Main JS | 102 kB gzip (+5 kB for the new ornaments) |

**Still not done:** testing on physical devices and in Safari or Firefox. The Bayon face is a deliberate, restrained interpretation; the families should confirm they are comfortable with sacred imagery on the invitation (it can be removed from `Closing.tsx`).
