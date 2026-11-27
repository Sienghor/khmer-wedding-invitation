# Phase 3: Component & Experience Architecture

## 1. Page structure

| # | Section | Component | Ground | Key elements |
|---|---|---|---|---|
| 01 | Ceremonial opening | `sections/Opening.tsx` | charcoal | 3D or SVG doorway, names in the opening, personalised greeting, glass "Open" button |
| n/a | Threshold (hero) | `sections/Hero.tsx` | ivory | Lintel above the couple portrait (parallax), names, date |
| 02 | Formal invitation | `sections/Invitation.tsx` | ivory | Ceremonial frame: parents, formal message; bride and groom portraits |
| 03 | Wedding details | `sections/Details.tsx` | burgundy | Date, glass countdown, venue and map, dress code, calendar |
| 04 | Photo album (កម្រងរូបភាព) | `sections/Story.tsx` | ivory | Masonry gallery and lightbox, behind-the-scenes clips. Story chapters removed (rev. 5). |
| 05 | Ceremony programme | `sections/Schedule.tsx` | ivory | Rosette timeline with a scroll-grown spine |
| 06 | Blessings (ផ្ញើពរជ័យ) | `sections/Blessings.tsx` | accent→charcoal | Glass blessing form with one-tap Khmer blessings, calendar, share. Replaced the RSVP form (rev. 4): Khmer weddings don't ask guests to confirm attendance. |
| 07 | Closing | `sections/Closing.tsx` | dusk | Bayon face tower, quincunx rises, naga causeway, thanks, replay |

Sections are composed in `App.tsx` and read only from `src/config`. Reorder or remove them there.

## 2. Source tree

```
src/
  config/        wedding.ts (all content) · photos.ts (photo slots) · theme.ts (palette, fonts)
  heritage/      registry.ts (provenance, single source of truth) · HeritageLab.tsx (?heritage viewer)
  ornaments/
    geometry/    path · lotus · kbach · naga · lintel · colonnette · tower (pure functions)
    *.tsx        OrnamentSvg wrapper, LotusPetalBand, LotusRosette, NagaFan, NagaBalustrade,
                 KbachLeaf, Lintel, Colonnette, TowerQuincunx, OrnamentDivider, CeremonialFrame
  motion/        tokens.ts · Reveal.tsx (shared IntersectionObserver) · useReducedMotion · motion.css
  three/         doorwayGeometry.ts (shared dimensions) · doorwayScene.ts (imperative scene)
                 Doorway3D.tsx (lazy React shell) · capability.ts (3D vs SVG decision)
  glass/         Glass.tsx + Glass.module.css (liquid glass surface)
  gallery/       PhotoFrame (skeleton/loaded/error) · Gallery (masonry) · Lightbox (<dialog>)
  sections/      Opening · Hero · Invitation · Details · Story · Schedule · Blessings · Closing
  components/    Bi · SectionHeader · Countdown · Nav · DevBanner
  lib/           text (placeholders) · date · guest · calendar · maps · share · blessings · music
  styles/        tokens.css · base.css
scripts/         check-heritage.ts · build-registry-doc.ts · qa.mjs · shoot.mjs · shoot-elements.mjs · contact-sheet.mjs
docs/            01–04 phase deliverables · heritage-registry.md (generated)
```

## 3. Separation of responsibilities

| Concern | Lives in | Never in |
|---|---|---|
| Wedding facts | `config/wedding.ts` | Components |
| Photos | `config/photos.ts` | Components (slots referenced by ID) |
| Palette and fonts | `config/theme.ts` → CSS variables | Hard-coded colours (except the pre-paint opening colour) |
| Motif provenance | `heritage/registry.ts` | Comments only |
| Ornament geometry | `ornaments/geometry` | SVG or Three components |
| Motion timing | `styles/tokens.css` and `motion/tokens.ts` | Ad-hoc durations |

## 4. Transitions

| Transition | Mechanism |
|---|---|
| Opening → invitation | Camera passes through the 3D doorway; ivory wash; the gate unmounts and Three.js is disposed. The SVG fallback scales the frame through. |
| Section entrances | `Reveal` (rise / fade / scale / unveil / draw / mask / image). Where `animation-timeline: view()` exists (Chrome, Safari 26+) each entrance is a keyframe animation on the element's own view timeline (`--rv`): it scrubs with the scroll, reverses on scroll-up, and completes within `--scrub-len` (26vh) of the element entering, so content on screen is never blank. Elsewhere (iOS 18 and older, Firefox) one shared IntersectionObserver adds `data-inview` and a 700 ms transition on `--ease-spring` plays once. Elements with an explicit `delay` (the hero), `timed`, or inside an `overflow: hidden/auto` box use the time path; sections should prefer `overflow: clip`. |
| Entrance vocabulary | `rise` lifts 14px; `fade` is opacity only (body copy); `mask` raises each heading line out of its own window (0.4em of room below for coeng subscripts, open above for Moul's tall vowels; text is never split); `image` opens a photo from `inset(10% 8%)` while it settles from 1.12×; `draw` strokes ornaments along the scroll |
| Choreography | `i` follows a gathering curve (0, 1, 1.82, 2.49 … steps; `choreo()` in `motion/tokens.ts`); `at` sets a hand-tuned offset. Section headers vary their rhythm (`procession` / `together` / `answer`): ornament first, together, or title first |
| Motion tokens | `--ease-spring` is a critically damped spring as CSS `linear()` (no overshoot; falls back to `--ease-ceremonial`); `--ease-scrub` for scroll-linked entrances; `--d-reveal` 700 ms, `--d-draw` 1400 ms; `--d-hero` / `--d-hero-draw` keep the long durations for the hero and doorway |
| Reduced motion | Nothing travels, clips or scrubs: time-path elements crossfade (280 ms), scroll-path elements are simply present, ornaments are drawn |
| Layered parallax | `.parallax` with `--depth`, CSS `animation-timeline: view()` (no JS); static where unsupported |
| Timeline spine | Scroll-driven `clip-path` growth |
| Gallery → lightbox | Native `<dialog>`. Shared-element View Transition: the tapped tile's photo takes `view-transition-name: lightbox-photo` and grows into the viewer, then shrinks back into its tile on close (if that tile is still on screen). Photo changes crossfade the same way. Without the API, or under reduced motion, it simply opens and closes |
| Countdown digits | Keyed re-mount with a short settle animation |
| Closing | Towers rise outer-first with staggered delays; a dawn glow fades in |

## 5. Responsive strategy (mobile first)

- **Opening:** a three-row grid (title / doorway / greeting). The doorway box is sized with container-query units (`100cqh`, `100cqw / aspect`) so it always fits. The 3D camera fits itself to that box, so HTML text lines up with the 3D opening at every size.
- **Navigation:** a bottom glass pill on phones (thumb reach) and a top pill from 900 px.
- **Layouts:** single column on phones. Two-column parents, three-column details cards, zigzag story chapters and an alternating timeline from 640–900 px.
- **Type:** fluid `clamp()` scale. Moul is only used at display sizes.
- **Gallery:** CSS columns (2 → 3), so photos keep their native ratio without gaps.
- **Complexity:** the 3D opening is skipped for reduced motion, Save-Data, low memory or no WebGL2. Pixel ratio is capped at 1.75.

## 6. Photo placeholder system

- Slots: `hero`, `groom`, `bride`, `story-1..3`, `video-poster`, `g-01..g-09`. Shapes are `tall` 2:3, `portrait` 4:5, `square` 1:1 and `landscape` 3:2.
- `PhotoFrame` reserves the exact aspect ratio, so there is zero layout shift. States: `empty` (skeleton and shimmer, with a rosette mark), `idle` (loading), `loaded` (fade and settle) and `error` (falls back to the skeleton, never a broken icon).
- To add a photo, set `src` (plus optional `srcSet`, `sizes` and `focal`) in `config/photos.ts`. No component changes are needed.

## 6b. 3D scenes (revision 2)

| Scene | Where | Built from | Behaviour |
|---|---|---|---|
| Doorway | Opening | Colonnette lathe (8 facets) + lintel relief extrusions + Banteay Srei superposed fronton (tube frames, extruded leaves, rosette; rear fronton set back in depth) | Assembles (fronton settles last), raking light, camera passes through; disposed after opening |
| Lintel | Hero | Same lintel relief (`DoorwayScene` variant `lintel`) | Turns toward the pointer / with scroll; light drifts across the carving |
| Temple | Closing | Redented-plan tier extrusions on the ogival envelope; lotus-petal lathe finials; tube + extruded-fan naga balustrades | Towers rise outer-first; camera orbits with scroll; dusk lighting |
| CSS 3D | Hero portrait only | `motion/Tilt3D` | Pointer tilt with specular sheen; scroll tilt on touch. Gallery tiles, films, the invitation card and portraits use the `image` reveal instead |

`three/LazyScene` shows the SVG rendering first, loads WebGL only near the viewport, after the opening, on capable devices, and crossfades it in. `three/SceneHost` pauses offscreen and disposes on unmount.

## 6c. Media pipeline

`npm run media` (`scripts/process-media.mjs`) turns `src/image/*.jpg` and `src/video/*.MOV` into `public/media/**` (WebP at 480/960/1440/2048 w with blur-up LQIP; silent H.264 MP4 with posters) and writes `src/config/media.generated.ts`. Crops (solo portraits, the BTS crop) are declared there.

## 6d. Visual identity (revision 3)

Main inspiration **Banteay Srei**; secondary **Angkor Wat** and **Bayon**. Material palette: warm sandstone, ivory, champagne, antique gold, on an olive ceremonial accent.

| Where | Banteay Srei / Angkor / Bayon element |
|---|---|
| Opening | 3D portal: superposed fronton (KH-PED-01) over the lintel (KH-LIN-01) on octagonal colonnettes (KH-COL-01) |
| Hero | Same portal in 2D/3D: sandstone fronton, 3D lintel, foliated-scroll pilasters (KH-VIN-01) flanking the photo as the doorway |
| Every section title | Superposed fronton crown (KH-PED-01) |
| Invitation card | Fronton crown, scroll pilasters down both sides |
| Invitation, Story backgrounds | Wall tapestry of squares with foliate motifs (KH-WAL-01), faded out of the reading column |
| Programme | Spine is a foliated-scroll pilaster |
| Closing | Bayon face tower (KH-BAY-01) above the thanks; Angkor Wat quincunx (KH-TWR-01) in 3D below |

Carved look: `CarveFilter` (Ornament.tsx) adds a cast shadow and a lit upper edge to SVG relief, without blur, so it is cheap enough to use widely.

## 7. Configuration surface

| Want to change… | Edit |
|---|---|
| Names, parents, date, venue, schedule, story, closing text | `src/config/wedding.ts` |
| Blessings destination | `wedding.blessings.endpoint` (JSON POST); `null` = demo mode |
| Music | `wedding.music` (src, title, artist). Player: `src/lib/music.ts`; button: `src/components/MusicToggle.tsx`. Starts on the "open" tap (browser gesture rule); guests who skip the opening start it with their first tap. Pauses when the tab is hidden; a guest's "off" choice is remembered. |
| Photos | `src/config/photos.ts` |
| Colours and fonts | `src/config/theme.ts` (`ACTIVE_THEME`: `olive` (current) or `burgundy`; preview with `?theme=burgundy`) |
| Full fill-in list | `docs/CONTENT-CHECKLIST.md` |
| Personalised guest link | `https://…/?to=Guest%20Name` |
| Force SVG opening (testing) | `?lite` · skip opening: `?skip` · registry viewer: `?heritage` |
