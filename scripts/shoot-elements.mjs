/** node scripts/shoot-elements.mjs <url> <selector> <outPrefix> [width] */
import { chromium } from 'playwright';
const [url, sel, prefix, w = '1280'] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: Number(w), height: 900 }, deviceScaleFactor: 1.5 });
await p.goto(url, { waitUntil: 'networkidle' });
await p.waitForTimeout(800);
const els = await p.$$(sel);
for (let i = 0; i < els.length; i++) await els[i].screenshot({ path: `${prefix}-${i}.png` });
console.log(els.length, 'elements');
await b.close();
