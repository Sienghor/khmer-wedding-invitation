# Phase 2: Heritage Design Specification

## 1. Approved motif set

Only these nine motifs may appear as ornament. Each is documented with quoted evidence in [`heritage-registry.md`](./heritage-registry.md) and viewable rendered at `/?heritage`.

| ID | Motif | Primary source | Where it appears |
|---|---|---|---|
| KH-LIN-01 | Banteay Srei-style lintel | NMC Sralao lintel (Ka.1819) | Opening doorway (3D/SVG), hero, details watermark |
| KH-LOT-01 | Upward lotus-petal moulding | Kbach mouldings; Sralao lotus row | Lintel base, section bands, frame base, colonnette collars |
| KH-LOT-02 | Lotus rosette | Angkor Wat gallery ceilings | Lintel centre, dividers, timeline nodes, skeletons, favicon |
| KH-NAG-01 | Three-headed naga fan | Khmer architecture; Sralao lintel | Lintel crests and terminals, balustrade |
| KH-NAG-02 | Naga balustrade | Angkor Wat causeway | Closing composition |
| KH-COL-01 | Octagonal ringed colonnette | Khmer architecture (Kulen/Khleang) | Opening doorway |
| KH-TWR-01 | Lotus-bud towers in quincunx | Angkor Wat | Closing composition |
| KH-KB-01 | Bodhi-leaf kbach figure | Kbach leafy-figure typology | Frame corners, divider terminals |
| KH-KB-02 | Snail-spiral kbach figure | Kbach angkor (kbach hien) | Lintel tendrils, dividers, leaf carving |

### Deliberate exclusions

- **Apsaras, devatas, deities, Garuda, dancers:** sacred and figurative. They are not reduced to decoration, and code cannot render them faithfully. The Sralao lintel's central Vishnu-on-Garuda is replaced by the Angkor Wat lotus rosette, and this is recorded in the registry.
- **Kala, makara, Sambor Prei Kuk medallions:** documented in outline only, not enough geometry to draw without invention.
- **Naga-framed pediments:** not verifiable in the sources, so no pediment arch is drawn.
- **Princess Rasmi Sobbhana's embroidery plates:** catalogue verified, plates unseen. Recommended as the next source to verify.

### Rules enforced in code

| Rule (from sources) | Enforcement |
|---|---|
| Lotus-petal mouldings "always adorned upwards" | `LotusPetalBand` has no flip prop. Frames place the band at the base only. |
| Naga heads "always uneven in number" | `nagaFan()` throws on an even count; the TS type is `1 \| 3 \| 5 \| 7`. |
| Lintel symmetry | Only the right half is generated; the left half is a mirrored `<use>`. |
| Octagonal colonnette | Three.js lathe with exactly 8 radial segments; SVG facet stops at true projected edges. |
| Every ornament has provenance | `data-motif` attribute on every ornament root; `npm run check:heritage` validates IDs. |
| No raster ornament | `check:heritage` fails on raster/SVG-file references or `<img>` outside the photo frame. The runtime QA counts non-photo `<img>` and CSS background images (both 0). |

## 2. Code-rendering strategy

```
src/ornaments/geometry/*.ts   pure functions → outlines (cubic Bézier), polylines, layouts
        │                        (no DOM, no React, no Three; runnable in Node)
        ├──► src/ornaments/*.tsx      inline SVG components (gradients, relief filter, draw-on)
        └──► src/three/doorwayScene.ts  THREE.Shape → ExtrudeGeometry, TubeGeometry, LatheGeometry
```

One geometry source drives both renderers, so the 3D lintel and the SVG lintel are the same drawing.

**Surface treatments, all code:** a vertical gilt gradient (light on the upper edge, like raked relief), incised detail strokes, an `feSpecularLighting` relief filter with an animatable point light (the "light across ornament" moment), and stroke-draw (`pathLength=1`) for tendrils and rules.

## 3. Palette

| Token | Value | Role |
|---|---|---|
| `--c-ivory` | `#F6F0E5` | Primary ground |
| `--c-champagne` | `#D5B77A` | Gilt highlights, light-tone ornament |
| `--c-gold` | `#A77B42` | Gilt body, rules |
| `--c-gold-ink` | gold 66% + charcoal | **Small gold text on ivory** (≥ 4.5:1; antique gold alone is 3.3:1) |
| `--c-burgundy` | `#632E32` | Ceremonial bands (details, RSVP), Khmer headings |
| `--c-charcoal` | `#24201C` | Text, opening, closing |
| `--c-sandstone` | `#B48474` | 3D stone. Banteay Srei is "built largely of red sandstone". |

Configured in `src/config/theme.ts` and injected as CSS variables. The 3D scene reads the same variables.

**Ground rhythm:** charcoal (opening) → ivory (hero, invitation) → burgundy (details) → ivory (story, programme) → burgundy-to-charcoal (RSVP) → dusk (closing). The sequence follows the visit, from doorway and galleries to sanctuary.

## 4. Typography

| Use | Face | Notes |
|---|---|---|
| Khmer display | **Moul** | Traditional ceremonial face; display sizes only |
| Khmer body | **Battambang** 400/700 | Line-height 1.95+ for stacked script |
| Latin display / body | **Cormorant Garamond** 400–600, italic | Names, English lines, numerals |
| UI | **Kantumruy Pro** | Form controls |

Khmer leads and English follows in every bilingual pair, each tagged with `lang`. Khmer numerals (០–៩) are used for section indices and the Khmer date (`Intl` with `numberingSystem: 'khmr'`).

## 5. Architectural visual elements

- **Doorway:** a lintel resting on two octagonal colonnettes over a threshold. Proportions follow the NMC lintel's 186 × 82 cm. Shared by the 3D scene and the SVG fallback through `src/three/doorwayGeometry.ts`.
- **Ceremonial frame:** a double gilt rule, Bodhi leaves pointing into the corners, a rosette crowning the top, and a lotus moulding at the base.
- **Divider:** rosette, snail spirals and Bodhi leaves on fine rules.
- **Closing:** a quincunx on three stepped terraces above mirrored naga balustrades with a lotus moulding.

## 6. Motion language: "ceremonial"

| Token | Curve / value | Use |
|---|---|---|
| `--ease-ceremonial` | `cubic-bezier(0.22, 1, 0.36, 1)` | All entrances: long deceleration, like a bow |
| `--ease-silk` | `cubic-bezier(0.65, 0, 0.35, 1)` | State changes, crossfades, camera |
| `--ease-exit` | `cubic-bezier(0.55, 0, 1, 0.45)` | Short departures |
| Durations | 220 / 520 / 900 / 1100 / 1800 ms | quick / base / slow / reveal / draw |
| Stagger | 90 ms | Sibling entrances |

**Principles:** transform and opacity only; nothing bounces or overshoots; ornament *draws* and text *rises*; one motion per element; and under `prefers-reduced-motion` every duration collapses to ~0 and the 3D scene is replaced by the static SVG doorway.

**Opening choreography** (seconds after the doorway is ready): background lamp 0–2.2 · colonnettes rise 0.2–1.9 · lintel settles 1.0–2.6 · raking light 2.0–5.0 · names 2.5 · greeting and button 3.5 · on open, the camera passes through the doorway in 1.5 s and ivory light washes in.
