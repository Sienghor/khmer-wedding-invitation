# Phase 1: Design & Technical Audit

*Date: 2026-11-21*

## 1. Reference invitation

**URL:** `https://e-theap.com/kh/events/rany-sikaly/rlAG2Q?v=67v3`

### What could actually be inspected

| Method | Result |
|---|---|
| Plain HTTP fetch | Returns a client-rendered Next.js shell. The only visible text is the page title, *“សំបុត្រអញ្ជើញពិធីមង្គលការ … \| E-Theap - អុី ធៀប”*. No section content is in the HTML. |
| Headless browser (Playwright, 390×844) | **One** screenshot of the landing/gate screen was captured before the site's anti-automation script replaced the page with *“Developer tools detected. Access denied.”* No further screens were reachable. |

The access control was **not** circumvented. Nothing below claims knowledge of the reference's inner sections, interactions or animations. Those could not be inspected.

### Observed on the landing screen (single screenshot)

- **Gate pattern:** a full-screen cover that must be opened ("បើកសំបុត្រ", *open the invitation*, with a round play-style button).
- **Personalised guest line:** "សូមគោរពអញ្ជើញ" (*respectfully invited*) followed by a framed panel containing the guest's name ("បង … នឹង ភរិយា"). Each link is personalised per guest.
- **Title lettering:** "សិរីមង្គលអាពាហ៍ពិពាហ៍" in a gold Moul-style display face.
- **Audio controls:** "រំលង" (*skip*) and a mute toggle, top right.
- **Imagery:** a full-bleed pre-wedding photograph, with raster decorative images layered over it (banana leaves, gold and silver offering objects, flowers, a gilt frame).
- **Fonts / scripts:** Next.js chunks; the font stack in the captured state was the system default (custom fonts likely load later).

### What this project takes from the reference, and what it changes

| Reference trait | Decision here |
|---|---|
| Gate that must be opened | **Kept**, reimagined as passing through a Khmer temple doorway (3D). |
| Personalised guest name | **Kept** via `?to=Name` / `?guest=Name`. The name also pre-fills the blessing form. |
| Moul gold title | **Kept** (Moul, self-hosted). |
| Raster decorations (leaves, offering objects, frames) | **Replaced.** All ornament is code-generated from documented Khmer motifs (project rule §3). |
| Music controls | **Optional.** `music.src` in config; no control is rendered without a track. |

## 2. Repository audit

| Item | Finding |
|---|---|
| Existing code | **None.** The working directory was empty (no framework, components, styles, tokens, assets or git). |
| Consequence | No stack to preserve. A stack was chosen on merit (below). |
| Tooling available | Node 26, npm 11, Playwright (headless Chromium) for QA. |

### Stack decision

| Concern | Choice | Reason |
|---|---|---|
| Build | **Vite 8** | Fast dev server, native CSS Modules, code-splitting for the 3D chunk. |
| UI | **React 19 + TypeScript** | Modular, configurable sections. TS types the content config and the registry. |
| Styling | **CSS Modules + design tokens** (CSS custom properties) | Scoped styles, no global leakage, no runtime CSS-in-JS cost. Tailwind was deliberately avoided (brief §15). |
| Motion | **No animation library.** CSS transitions, a shared IntersectionObserver, CSS scroll-driven animations, and one rAF loop in the 3D scene | Smallest payload; transform/opacity only. |
| 3D | **Three.js r187**, lazy-loaded chunk | Only the opening uses it, so it is never in the main bundle. |
| Fonts | **@fontsource** (self-hosted Moul, Battambang, Kantumruy Pro, Cormorant Garamond) | No third-party font requests; `unicode-range` subsets. |
| QA | Playwright, axe-core | Automated viewport, flow and accessibility checks. |

Runtime dependencies: `react`, `react-dom`, `three`, four `@fontsource` packages. Nothing else.

## 3. Heritage research

Sources were fetched and quoted; nothing was taken from memory. Full provenance is in [`heritage-registry.md`](./heritage-registry.md).

| Source | Access | Used for |
|---|---|---|
| National Museum of Cambodia, *Lintel* (Sralao Temple, Ka.1819) | ✅ read | Lintel composition, three-headed naga, lotus row |
| Wikipedia: *Khmer architecture* (raw wikitext) | ✅ read | Style periods, colonnettes, naga, lintel styles |
| Wikipedia: *Angkor Wat* (raw wikitext) | ✅ read | Lotus-bud towers, quincunx, naga balustrade, lotus rosettes |
| Wikipedia: *Kbach* | ✅ read | Kbach repertoire: lotus-petal mouldings, snail spiral, Bodhi leaf |
| Wikipedia: *Banteay Srei*, *Preah Khan*, *Bayon*, *Sambor Prei Kuk*, *Angkor* | ✅ read | Dates, context, exclusions |
| Angkor Database: Princess Rasmi Sobbhana, *Motifs décoratifs khmèrs* | ✅ catalogue record only | Bibliography. Plates not inspected, so no motif is derived from them. |
| UNESCO WHC 668 and 1532 | ❌ HTTP 403 to automated access | Inscription facts taken from Wikipedia infoboxes instead and labelled as such |
| APSARA Authority | Not needed for any motif used | n/a |

## 4. Visual direction (established)

**Concept: *Through the Doorway*.** A guest arrives at a Khmer sanctuary doorway: two octagonal colonnettes carrying a Banteay Srei-style lintel. They pass through it into the invitation, and leave before Angkor Wat's quincunx of lotus-bud towers at dusk. The structure is architectural (threshold → galleries → sanctuary), not decorative.

## 5. Technical constraints identified

- Khmer script stacks subscripts and vowel signs vertically, so all Khmer text uses a line-height of at least 1.95. Moul is reserved for display sizes.
- WebGL must degrade gracefully: reduced motion, Save-Data, low memory, no WebGL2, context loss.
- The real photographs are not yet available, so every slot is a fixed-aspect skeleton with zero layout shift.
- No wedding facts are known, so every fact is a visible `[placeholder]` in one config file.
