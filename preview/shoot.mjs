// Screenshot helper (Playwright + the pre-installed Chromium).
//   node preview/shoot.mjs page index.html preview/desktop-full.png 1440 900 full
//   node preview/shoot.mjs page index.html preview/mobile-full.png 390 844 full mobile
//   node preview/shoot.mjs banners banners/banners.html banners
// Prints loaded fonts, horizontal-overflow check, page height and any console errors.
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); }
catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }

const [mode, src, out, w, h, full, mobile] = process.argv.slice(2);
const launch = { executablePath: process.env.CHROME_PATH || undefined };
const browser = await chromium.launch(launch);

// Optional: serve Google Fonts from a local cache (FONT_DIR holds local.css + f*.woff2 fetched with curl),
// for environments where the headless browser cannot reach fonts.googleapis.com directly.
async function routeFonts(ctx) {
  const dir = process.env.FONT_DIR;
  if (!dir) return;
  const { readFileSync, existsSync } = await import('node:fs');
  await ctx.route(/https:\/\/fonts\.googleapis\.com\/.*/, r => r.fulfill({ status: 200, contentType: 'text/css', body: readFileSync(`${dir}/local.css`, 'utf8') }));
  await ctx.route(/https:\/\/fonts\.gstatic\.com\/local\/(.+)/, r => {
    const f = `${dir}/${r.request().url().split('/local/')[1]}`;
    return existsSync(f) ? r.fulfill({ status: 200, contentType: 'font/woff2', body: readFileSync(f) }) : r.abort();
  });
}

if (mode === 'page') {
  const isMobile = mobile === 'mobile';
  const ctx = await browser.newContext({ viewport: { width: +w, height: +h }, deviceScaleFactor: isMobile ? 2 : 1, isMobile, hasTouch: isMobile });
  await routeFonts(ctx);
  const pg = await ctx.newPage();
  const errs = [];
  pg.on('pageerror', e => errs.push(String(e)));
  pg.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errs.push(`console.${m.type()}: ${m.text()}`); });
  await pg.goto(pathToFileURL(resolve(src)).href);
  await pg.evaluate(() => document.fonts.ready);
  await pg.waitForTimeout(1200);
  // force pending reveals + rails so a full-page capture is complete
  await pg.evaluate(() => {
    document.querySelectorAll('.reveal-pending').forEach(e => e.classList.add('in'));
    document.querySelectorAll('[data-rail-item]').forEach(e => e.classList.add('lit'));
    document.querySelectorAll('.rail').forEach(e => e.style.setProperty('--progress', 1));
    document.querySelector('#grow')?.classList.add('in');
  });
  await pg.waitForTimeout(full === 'full' ? 4200 : 600);
  const report = await pg.evaluate(() => ({
    fonts: [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family).filter((v, i, a) => a.indexOf(v) === i),
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    scrollW: document.documentElement.scrollWidth, clientW: document.documentElement.clientWidth,
    h: document.documentElement.scrollHeight
  }));
  console.log('fonts:', report.fonts.join(', '));
  console.log('overflow:', report.overflow, report.scrollW, report.clientW, 'height:', report.h);
  console.log('errors:', errs.length ? errs : 'none');
  await pg.screenshot({ path: out, fullPage: full === 'full' });
  console.log('wrote', out);
} else if (mode === 'banners') {
  mkdirSync(out, { recursive: true });
  const ctx = await browser.newContext({ viewport: { width: 2600, height: 2000 }, deviceScaleFactor: 1 });
  await routeFonts(ctx);
  const pg = await ctx.newPage();
  const errs = [];
  pg.on('pageerror', e => errs.push(String(e)));
  await pg.goto(pathToFileURL(resolve(src)).href);
  await pg.evaluate(() => document.fonts.ready);
  await pg.waitForTimeout(1500);
  for (const el of await pg.$$('.canvas')) {
    const name = await el.getAttribute('data-name');
    const box = await el.boundingBox();
    await el.screenshot({ path: `${out}/${name}.png` });
    console.log('wrote', name, Math.round(box.width), 'x', Math.round(box.height));
  }
  console.log('errors:', errs.length ? errs : 'none');
}
await browser.close();
