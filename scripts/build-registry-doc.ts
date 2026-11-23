/** Generates docs/heritage-registry.md from src/heritage/registry.ts (npm run registry). */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { HERITAGE_MOTIFS, RESEARCHED_NOT_USED } from '../src/heritage/registry.ts';

const out = fileURLToPath(new URL('../docs/heritage-registry.md', import.meta.url));
const esc = (s: string) => s.replace(/\|/g, '\\|');
let md = `# Heritage Reference Registry

> Generated from \`src/heritage/registry.ts\` by \`npm run registry\`. Do not edit by hand.
> Every ornament rendered by the invitation carries a \`data-motif\` attribute naming one or more of these IDs.
> \`npm run check:heritage\` fails the build if an ornament references an unregistered ID.
> The live, rendered version of this registry is at \`/?heritage\`.

## Summary

| ID | Motif | Source | Period / style | Status |
|---|---|---|---|---|
${HERITAGE_MOTIFS.map((m) => `| ${m.id} | ${esc(m.englishName)} | ${esc(m.templeOrArtifact.split('.')[0])} | ${esc(m.period ?? 'Not established by the cited sources')} | ${m.status} |`).join('\n')}

`;
for (const m of HERITAGE_MOTIFS) {
  md += `---

## ${m.id}: ${m.englishName}

| Field | Value |
|---|---|
| Khmer name | ${m.khmerName ?? `*Not recorded.* ${esc(m.khmerNameNote ?? '')}`} |
| English name | ${esc(m.englishName)} |
| Heritage source | ${esc(m.heritageSource)} |
| Temple / artifact | ${esc(m.templeOrArtifact)} |
| Period / style | ${esc(m.period ?? 'Not established by the cited sources')} |
| Verification | ${m.status} |
| Implementation | ${m.implementation.map((p) => `\`${p}\``).join('<br>')} |

**Evidence (quoted from source)**

${m.references.map((r) => `- ${r.quote ? `“${r.quote}”, ` : ''}[${r.label}](${r.url})`).join('\n')}

**Documented visual characteristics**

${m.characteristics.map((c) => `- ${c}`).join('\n')}

**Adaptation notes**

${m.adaptationNotes.map((c) => `- ${c}`).join('\n')}

`;
}
md += `---

## Researched, not used

${RESEARCHED_NOT_USED.map((r) => `- **${r.source}** ([source](${r.url})): ${r.reason}`).join('\n')}
`;
writeFileSync(out, md);
console.log(`✓ Wrote ${out} (${HERITAGE_MOTIFS.length} motifs)`);
