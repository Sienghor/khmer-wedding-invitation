/**
 * Runtime QA suite: node scripts/qa.mjs [baseUrl]
 * Default target is the production preview (npm run build && npm run preview).
 *
 * Checks, per viewport: horizontal overflow, console errors/warnings, page errors.
 * Flows: opening → open → main; blessing submit; lightbox keyboard; reduced motion;
 * axe-core accessibility audit; runtime motif-ID validation against the registry;
 * broken images; Khmer font loading; and a rough frame-time sample of the 3D opening.
 * Writes qa-output/qa-report.json and screenshots.
 */
import { chromium } from 'playwright';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';

// Default: the real Worker with a local database (`npm run cf:dev`), so the blessing flow is tested end to end.
const base = process.argv[2] ?? 'http://localhost:8787/';
const require = createRequire(import.meta.url);
const axeSource = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const registryIds = [...readFileSync(new URL('../src/heritage/registry.ts', import.meta.url), 'utf8').matchAll(/id: '(KH-[A-Z]+-\d{2})'/g)].map((m) => m[1]);
mkdirSync('qa-output', { recursive: true });

const VIEWPORTS = [
  ['small-phone', 320, 568],
  ['phone', 360, 740],
  ['iphone', 390, 844],
  ['large-phone', 430, 932],
  ['tablet-portrait', 768, 1024],
  ['tablet-landscape', 1024, 768],
  ['desktop', 1440, 900],
  ['large-desktop', 1920, 1080],
];

const report = { base, startedAt: new Date().toISOString(), viewports: [], flows: {}, axe: null, motifs: null, perf: null };
const browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader'] });

async function newPage(w, h, extra = {}) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, hasTouch: w < 800, ...extra });
  const page = await ctx.newPage();
  const problems = [];
  page.on('console', (m) => (m.type() === 'error' || m.type() === 'warning') && problems.push(`[${m.type()}] ${m.text()}`));
  page.on('pageerror', (e) => problems.push(`[pageerror] ${e.message}`));
  page.on('requestfailed', (r) => problems.push(`[requestfailed] ${r.url()}`));
  return { ctx, page, problems };
}

const overflow = (page) => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

// 1. Viewport sweep: opening + main page
for (const [name, w, h] of VIEWPORTS) {
  const { ctx, page, problems } = await newPage(w, h);
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.waitForTimeout(6500);
  const gateOverflow = await overflow(page);
  const gateMode = await page.evaluate(() => document.querySelector('[data-mode]')?.getAttribute('data-mode'));
  // Opening layout: the doorway frame and the button must be fully on-screen.
  const gateFit = await page.evaluate(() => {
    const vis = (el) => {
      if (!el) return false;
      const r = el.getBoundingClientRect();
      return r.top >= -1 && r.left >= -1 && r.bottom <= innerHeight + 1 && r.right <= innerWidth + 1;
    };
    return { frame: vis(document.querySelector('[class*=frame]')), button: vis(document.querySelector('[data-open-invitation]')) };
  });
  await page.screenshot({ path: `qa-output/qa-${name}-opening.png` });
  await page.click('[data-open-invitation]');
  await page.waitForTimeout(3200);
  const opened = await page.evaluate(() => !document.querySelector('[data-phase]') && !document.querySelector('main').inert);
  // Walk the page so every lazy image / reveal is exercised.
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < height; y += Math.round(h * 0.8)) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(120);
  }
  await page.waitForTimeout(1500);
  const mainOverflow = await overflow(page);
  const unrevealed = await page.evaluate(() => [...document.querySelectorAll('[data-reveal]')].filter((e) => !e.dataset.inview).length);
  const smallTargets = await page.evaluate(() =>
    [...document.querySelectorAll('main button, main a, nav a, input, textarea')]
      .filter((e) => e.offsetParent !== null && !e.closest('[aria-hidden="true"]'))
      .map((e) => e.getBoundingClientRect())
      .filter((r) => r.width > 0 && (r.height < 40 || r.width < 40)).length,
  );
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(600);
  await page.screenshot({ path: `qa-output/qa-${name}-main.png` });
  report.viewports.push({ name, w, h, gateMode, gateOverflow, gateFit, opened, mainOverflow, height, unrevealed, smallTargets, problems });
  console.log(`${name.padEnd(17)} ${w}x${h}  mode=${gateMode} gateOvf=${gateOverflow} fit=${JSON.stringify(gateFit)} opened=${opened} mainOvf=${mainOverflow} unrevealed=${unrevealed} smallTargets=${smallTargets} problems=${problems.length}`);
  await ctx.close();
}

// 2. Flows on the main page (skip the opening)
{
  const { ctx, page, problems } = await newPage(390, 844);
  await page.goto(base + '?skip&to=Sokha%20Chan', { waitUntil: 'networkidle' });

  // Blessings
  await page.locator('#blessings').scrollIntoViewIfNeeded();
  const prefilled = await page.inputValue('#blessings input[name=name]');
  await page.fill('#blessings input[name=name]', 'QA Guest');
  await page.locator('#blessings [role=group] button').first().click();
  const suggestion = await page.inputValue('#blessings textarea');
  await page.click('#blessings button[type=submit]');
  await page.waitForSelector('#blessings [role=status] >> text=សូមអរគុណ', { timeout: 5000 });
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('kwi.blessings') ?? '[]'));
  report.flows.blessings = { prefilledFromLink: prefilled, suggestionInserted: suggestion.length > 0, submitted: true, storedDemo: stored.at(-1) };

  // Lightbox
  await page.locator('#story ul button').first().scrollIntoViewIfNeeded();
  await page.locator('#story ul button').first().click();
  await page.waitForSelector('dialog[open]');
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(500);
  const count = await page.textContent('dialog [aria-live]');
  const focusInDialog = await page.evaluate(() => !!document.activeElement?.closest('dialog'));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  const closed = await page.evaluate(() => !document.querySelector('dialog[open]'));
  report.flows.lightbox = { counterAfterArrow: count?.trim(), focusInDialog, closedWithEscape: closed };

  // Calendar link + share fallback present
  report.flows.calendar = {
    google: await page.getAttribute('#details a[href*="calendar.google.com"]', 'href').then((h) => !!h),
    icsButton: (await page.locator('#details button:has-text(".ics")').count()) > 0,
  };

  // Runtime motif validation + no raster ornaments
  report.motifs = await page.evaluate((ids) => {
    const els = [...document.querySelectorAll('[data-motif]')];
    const found = new Set(els.flatMap((e) => e.getAttribute('data-motif').split(' ')));
    const unknown = [...found].filter((id) => !ids.includes(id));
    const imgs = [...document.querySelectorAll('img')].filter((i) => !i.closest('[data-photo-id]')).length;
    // Photo blur-up previews (inside photo frames) are photography, not ornament.
    const bgImages = [...document.querySelectorAll('*')].filter((e) => !e.closest('[data-photo-id]') && /url\(/.test(getComputedStyle(e).backgroundImage)).length;
    return { note: 'data-motif is emitted in development builds only; npm run check:heritage enforces motif declarations statically', ornamentElements: els.length, motifIdsOnPage: [...found].sort(), unknown, nonPhotoImgs: imgs, cssBackgroundImages: bgImages };
  }, registryIds);

  // Broken images & fonts
  report.flows.assets = await page.evaluate(async () => {
    await document.fonts.ready;
    const fams = ['Moul', 'Battambang', 'Cormorant Garamond'];
    return {
      brokenImages: [...document.images].filter((i) => i.complete && i.naturalWidth === 0 && i.src).length,
      fontsLoaded: Object.fromEntries(fams.map((f) => [f, document.fonts.check(`16px "${f}"`, 'ក')])),
    };
  });

  // axe-core accessibility audit
  await page.addScriptTag({ content: axeSource });
  report.axe = await page.evaluate(async () => {
    const r = await window.axe.run(document, { resultTypes: ['violations'] });
    return r.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.length, sample: v.nodes[0]?.target }));
  });
  report.flows.mainProblems = problems;
  await ctx.close();
}

// 3. Reduced motion: SVG doorway, everything visible, opening still works
{
  const { ctx, page, problems } = await newPage(390, 844, { reducedMotion: 'reduce' });
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  const mode = await page.evaluate(() => document.querySelector('[data-mode]')?.getAttribute('data-mode'));
  const readyQuickly = await page.evaluate(() => document.querySelector('[data-phase]')?.getAttribute('data-phase'));
  await page.screenshot({ path: 'qa-output/qa-reduced-opening.png' });
  await page.click('[data-open-invitation]');
  await page.waitForTimeout(600);
  const opened = await page.evaluate(() => !document.querySelector('[data-phase]'));
  const hidden = await page.evaluate(() => [...document.querySelectorAll('[data-reveal]')].filter((e) => getComputedStyle(e).opacity !== '1').length);
  report.flows.reducedMotion = { mode, phaseAfter800ms: readyQuickly, opened, hiddenRevealElements: hidden, problems };
  await ctx.close();
}

// 4. Keyboard: the opening button receives focus and Enter opens
{
  const { ctx, page } = await newPage(1440, 900);
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.waitForTimeout(7000);
  const focused = await page.evaluate(() => (document.activeElement?.hasAttribute('data-open-invitation') ? 'open-invitation button' : document.activeElement?.tagName));
  await page.addScriptTag({ content: axeSource });
  report.axeOpening = await page.evaluate(async () => {
    const r = await window.axe.run(document, { resultTypes: ['violations'] });
    return r.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.length, sample: v.nodes[0]?.target }));
  });
  await page.keyboard.press('Enter');
  await page.waitForTimeout(3000);
  const opened = await page.evaluate(() => !document.querySelector('[data-phase]'));
  report.flows.keyboardOpen = { focusedOnReady: focused, openedWithEnter: opened };
  await ctx.close();
}

// 5. Frame timing of the 3D opening (software GL in headless: indicative only)
{
  const { ctx, page } = await newPage(390, 844);
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const gl = await page.evaluate(() => ({ ...document.querySelector('canvas')?.dataset }));
  report.perf = await page.evaluate(
    () =>
      new Promise((res) => {
        const t = [];
        let last = performance.now();
        const loop = (now) => {
          t.push(now - last);
          last = now;
          if (t.length < 120) requestAnimationFrame(loop);
          else {
            t.sort((a, b) => a - b);
            res({ frames: t.length, medianMs: +t[60].toFixed(1), p95Ms: +t[114].toFixed(1), note: 'headless SwiftShader (CPU) WebGL; real GPUs are far faster' });
          }
        };
        requestAnimationFrame(loop);
      }),
  );
  report.perf.renderer = gl;
  await ctx.close();
}

await browser.close();
report.finishedAt = new Date().toISOString();
writeFileSync('qa-output/qa-report.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify({ flows: report.flows, axe: report.axe, motifs: report.motifs, perf: report.perf }, null, 1));
