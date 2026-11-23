/**
 * Screenshot helper for QA.
 *   node scripts/shoot.mjs <url> <out.png> [width] [height] [--full] [--wait=ms] [--click=selector] [--scroll=y] [--reduced]
 * Prints console errors/warnings and page errors so QA catches runtime issues.
 */
import { chromium } from 'playwright';
import { existsSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const [url, out, w = '390', h = '844', ...flags] = process.argv.slice(2);
const flag = (n) => flags.find((f) => f.startsWith(`--${n}`));
const val = (n) => flag(n)?.split('=').slice(1).join('=');

function fallbackExecutable() {
  const dir = join(homedir(), 'Library/Caches/ms-playwright');
  if (!existsSync(dir)) return undefined;
  const shell = readdirSync(dir).filter((d) => d.startsWith('chromium_headless_shell-')).sort().pop();
  if (!shell) return undefined;
  const p = join(dir, shell, 'chrome-headless-shell-mac-arm64/chrome-headless-shell');
  return existsSync(p) ? p : undefined;
}

let browser;
try {
  browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader'] });
} catch {
  browser = await chromium.launch({ executablePath: fallbackExecutable(), args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader'] });
}
const ctx = await browser.newContext({
  viewport: { width: Number(w), height: Number(h) },
  deviceScaleFactor: Number(val('dpr') ?? (flag('full') ? 1 : 2)),
  reducedMotion: flag('reduced') ? 'reduce' : 'no-preference',
  hasTouch: Number(w) < 800,
});
const page = await ctx.newPage();
const problems = [];
page.on('console', (m) => (m.type() === 'error' || m.type() === 'warning') && problems.push(`[${m.type()}] ${m.text()}`));
page.on('pageerror', (e) => problems.push(`[pageerror] ${e.message}`));
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(Number(val('wait') ?? 1500));
if (flag('click')) {
  await page.click(val('click'));
  await page.waitForTimeout(Number(val('after') ?? 2500));
}
if (flag('scroll')) {
  const target = val('scroll');
  await page.evaluate((t) => {
    const el = isNaN(Number(t)) ? document.querySelector(t) : null;
    if (el) el.scrollIntoView({ block: 'start', behavior: 'instant' });
    else window.scrollTo({ top: Number(t), behavior: 'instant' });
  }, target);
  await page.waitForTimeout(1800);
}
const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
await page.screenshot({ path: out, fullPage: !!flag('full') });
console.log(JSON.stringify({ out, overflowX: overflow, problems }, null, 1));
await browser.close();
