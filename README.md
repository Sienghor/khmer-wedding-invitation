# Khmer Wedding Invitation · សិរីមង្គលអាពាហ៍ពិពាហ៍

An immersive digital wedding invitation built on documented Khmer heritage. Guests pass through a 3D Khmer sanctuary doorway (octagonal colonnettes carrying a Banteay Srei-style lintel) into the invitation. They leave before Angkor Wat's quincunx of lotus-bud towers.

**Every ornament is drawn by code**, and each one traces to a quoted heritage source in [`src/heritage/registry.ts`](src/heritage/registry.ts).

## Quick start

```bash
npm install
npm run dev          # http://localhost:5173
npm run verify       # typecheck + heritage policy check + production build
npm run preview      # serve the production build on :4173
npm run qa           # full QA suite against :4173 → qa-output/
```

Useful URLs: `/?to=Guest%20Name` (personalised) · `/?skip` (skip opening) · `/?lite` (no WebGL) · `/?theme=burgundy` (palette preview; olive is the published theme) · `/?heritage` (registry viewer, development only: not shipped to guests).

Media: `npm run media` regenerates web photos, videos and music from `src/image`, `src/video` and `src/music`. Those originals are not in git (full resolution, location data); keep your own copy. The processed files in `public/media` are committed, so a fresh clone builds and deploys without them.

## Before publishing: fill in the real details

The complete field-by-field list, with current status, is in **[docs/CONTENT-CHECKLIST.md](docs/CONTENT-CHECKLIST.md)**.


1. **`src/config/wedding.ts`**: replace every `[bracketed]` placeholder, set `event.start` and `event.end`, and set `dateIsPlaceholder: false`. Review the template Khmer wording with the families.
2. **Photos**: originals go in `src/image` / `src/video`; run `npm run media`; choose which photo fills each slot in `src/config/photos.ts`.
3. **Blessings**: stored by the Cloudflare Worker in D1 (see docs/DEPLOY.md); read them at `/admin`.
4. Music and clips: originals go in `src/music` / `src/video`; add them to SOURCES in `scripts/process-media.mjs`, then run `npm run media`. Clips are listed in `story.films` in `wedding.ts`.
5. Optional: the palette in `src/config/theme.ts`.

In development, a banner counts the remaining placeholders.

## Live site (Cloudflare)

https://sienghor-saing.sienghor.workers.dev. Publish changes with `npm run deploy`; guests' blessings are at `/admin`. Details: [docs/DEPLOY.md](docs/DEPLOY.md).

## Documentation

| Phase | Document |
|---|---|
| 1 · Research & audit | [docs/01-design-technical-audit.md](docs/01-design-technical-audit.md) |
| 2 · Heritage design system | [docs/02-heritage-design-spec.md](docs/02-heritage-design-spec.md) |
| 2 · Provenance registry | [docs/heritage-registry.md](docs/heritage-registry.md) (generated: `npm run registry`) |
| 3 · Experience architecture | [docs/03-experience-architecture.md](docs/03-experience-architecture.md) |
| 5 · QA report | [docs/04-qa-report.md](docs/04-qa-report.md) |
| Deployment (Cloudflare) | [docs/DEPLOY.md](docs/DEPLOY.md) |

## Ornament rules (enforced)

- No raster or external-file ornament. `npm run check:heritage` fails otherwise.
- Every ornament declares registry motif IDs (`data-motif`).
- Lotus-petal mouldings always point up. Naga heads are always an odd number. Lintels are mirrored from one half.
- Adding a motif: research it, add a registry entry with quoted evidence, write geometry in `src/ornaments/geometry`, then render it.
