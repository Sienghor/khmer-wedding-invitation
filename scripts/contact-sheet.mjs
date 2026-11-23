/** Compose PNGs into one contact sheet using a headless page (no image libs needed). node scripts/contact-sheet.mjs out.png cols in1.png in2.png ... */
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
const [out, cols, ...files] = process.argv.slice(2);
const imgs = files.map((f) => `<img src="data:image/png;base64,${readFileSync(f).toString('base64')}">`).join('');
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1600, height: 800 } });
await p.setContent(`<style>body{margin:0;background:#ddd}div{display:grid;grid-template-columns:repeat(${cols},1fr);gap:6px;padding:6px}img{width:100%;height:auto;background:#fff}</style><div>${imgs}</div>`);
await p.screenshot({ path: out, fullPage: true });
await b.close();
