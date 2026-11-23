/**
 * Static heritage & ornament-policy checks (npm run check:heritage).
 *  1. Every motif ID referenced in source exists in the registry.
 *  2. Every registered motif is actually rendered somewhere (no orphan entries).
 *  3. Every ornament component declares motifs (OrnamentSvg motifs=… or delegates to one that does).
 *  4. No raster or external SVG files are imported or referenced anywhere in src/.
 *  5. The only <img> in the codebase is the photo frame (photography exception).
 *  6. Every registry entry has at least one reference with a URL and quote.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { HERITAGE_MOTIFS } from '../src/heritage/registry.ts';

const root = fileURLToPath(new URL('..', import.meta.url));
const src = join(root, 'src');
const files: string[] = [];
const walk = (d: string) => {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(tsx?|css)$/.test(f)) files.push(p);
  }
};
walk(src);

const ids = new Set(HERITAGE_MOTIFS.map((m) => m.id));
const problems: string[] = [];
const used = new Set<string>();

for (const f of files) {
  const rel = relative(root, f);
  const text = readFileSync(f, 'utf8');
  if (rel === 'src/heritage/registry.ts') continue;
  for (const m of text.matchAll(/['"](KH-[A-Z]+-\d{2})['"]/g)) {
    if (!ids.has(m[1])) problems.push(`${rel}: unknown motif id ${m[1]}`);
    used.add(m[1]);
  }
  // Photography exception: only the photo configuration and its generated manifest may name raster files.
  const PHOTO_FILES = ['src/config/photos.ts', 'src/config/media.generated.ts'];
  if (!PHOTO_FILES.includes(rel) && /\.(png|jpe?g|webp|gif|avif)['")]/i.test(text)) problems.push(`${rel}: references a raster file`);
  if (/import[^;]+\.svg['"]/.test(text)) problems.push(`${rel}: imports an external SVG file`);
  if (/<img\b/.test(text) && rel !== 'src/gallery/PhotoFrame.tsx') problems.push(`${rel}: <img> outside the photo frame`);
  if (/url\((?!#|['"]?data:image\/svg)/.test(text) && rel.endsWith('.css')) problems.push(`${rel}: CSS url() to an external asset`);
}

// Ornament components must declare their motifs.
for (const f of files.filter((p) => /src\/ornaments\/[A-Z]\w+\.tsx$/.test(p))) {
  const rel = relative(root, f);
  const text = readFileSync(f, 'utf8');
  if (rel.endsWith('Ornament.tsx')) continue;
  const declares = /motifs=\{\[/.test(text);
  const delegates = /<(LotusPetalBand|LotusRosette|KbachLeaf|NagaFan|Lintel|Colonnette)\b/.test(text);
  if (!declares && !delegates) problems.push(`${rel}: ornament component does not declare motifs`);
}

for (const id of ids) if (!used.has(id)) problems.push(`registry: ${id} is registered but never rendered`);
for (const m of HERITAGE_MOTIFS) {
  if (!m.references.some((r) => r.url.startsWith('https://') && r.quote)) problems.push(`registry: ${m.id} lacks a quoted, linked reference`);
  if (!m.implementation.length) problems.push(`registry: ${m.id} lists no implementation files`);
  for (const p of m.implementation) {
    try {
      statSync(join(root, p));
    } catch {
      problems.push(`registry: ${m.id} implementation file missing: ${p}`);
    }
  }
}

if (problems.length) {
  console.error(`✗ Heritage check failed (${problems.length}):\n  - ${problems.join('\n  - ')}`);
  process.exit(1);
}
console.log(`✓ Heritage check passed: ${ids.size} motifs registered, all rendered, all referenced IDs valid, no raster/external ornament assets in ${files.length} source files.`);
