// Builds the designed playbook PDF from playbook.html with the installed Chromium.
//   node marketing/playbook/build-pdf.mjs            → thumbs/, Nodal-Gateway-Launch-Playbook.pdf, review/ page PNGs
// Fonts: Google Fonts, or a local cache when FONT_DIR is set (see marketing/README.md).
import path from 'node:path';
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const postersDir = path.join(root, 'marketing', 'posters', 'out');
const thumbsDir = path.join(here, 'thumbs');
const reviewDir = path.join(here, 'review');
const pdfOut = path.join(here, 'Nodal-Gateway-Launch-Playbook.pdf');
mkdirSync(thumbsDir, { recursive: true });
mkdirSync(reviewDir, { recursive: true });

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined });

/* 1. Poster thumbnails (420 px) so the PDF stays small */
const tp = await browser.newPage();
for (const name of ['01-gateway', '02-ten-dollars', '03-three-steps', '04-ecosystem', '05-no-hype', '06-live-now']) {
  const src = path.join(postersDir, `${name}-square-1080x1080.png`);
  const data = readFileSync(src).toString('base64');
  await tp.setContent(`<img id="i" src="data:image/png;base64,${data}">`);
  const png = await tp.evaluate(() => new Promise(res => {
    const i = document.getElementById('i');
    const go = () => { const c = document.createElement('canvas'); c.width = 420; c.height = 420; const x = c.getContext('2d'); x.imageSmoothingQuality = 'high'; x.drawImage(i, 0, 0, 420, 420); res(c.toDataURL('image/png').split(',')[1]); };
    i.complete ? go() : (i.onload = go);
  }));
  writeFileSync(path.join(thumbsDir, `${name}.png`), Buffer.from(png, 'base64'));
}
await tp.close();

/* 2. Render the document */
const ctx = await browser.newContext({ viewport: { width: 794, height: 1123 }, deviceScaleFactor: 1 });
const fontDir = process.env.FONT_DIR;
if (fontDir) {
  await ctx.route(/https:\/\/fonts\.googleapis\.com\/.*/, r => r.fulfill({ status: 200, contentType: 'text/css', body: readFileSync(`${fontDir}/local.css`, 'utf8') }));
  await ctx.route(/https:\/\/fonts\.gstatic\.com\/local\/(.+)/, r => { const f = `${fontDir}/${r.request().url().split('/local/')[1]}`; return existsSync(f) ? r.fulfill({ status: 200, contentType: 'font/woff2', body: readFileSync(f) }) : r.abort(); });
}
const pg = await ctx.newPage();
const errs = [];
pg.on('pageerror', e => errs.push(String(e)));
pg.on('requestfailed', r => errs.push('request failed: ' + r.url()));
await pg.goto(pathToFileURL(path.join(here, 'playbook.html')).href);
await pg.evaluate(() => document.fonts.ready);
await pg.waitForTimeout(800);

const report = await pg.evaluate(() => ({
  fonts: [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family).filter((v, i, a) => a.indexOf(v) === i),
  pages: [...document.querySelectorAll('.page')].map((p, i) => {
    const inner = p.querySelector('.in');
    return { page: i + 1, overflow: inner ? Math.max(0, inner.scrollHeight - inner.clientHeight) : 0 };
  }),
  brokenImgs: [...document.images].filter(i => i.complete && i.naturalWidth === 0).map(i => i.getAttribute('src'))
}));
console.log('fonts:', report.fonts.join(', '));
console.log('content overflow per page (px):', report.pages.map(p => `${p.page}:${p.overflow}`).join('  '));
if (report.brokenImgs.length) console.log('broken images:', report.brokenImgs);
if (errs.length) console.log('errors:', errs);

await pg.pdf({ path: pdfOut, format: 'A4', printBackground: true, preferCSSPageSize: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
const buf = readFileSync(pdfOut);
const pageCount = (buf.toString('latin1').match(/\/Type\s*\/Page(?![s])/g) || []).length;
console.log(`wrote ${path.relative(root, pdfOut)} · ${(buf.length / 1024 / 1024).toFixed(2)} MB · ${pageCount} pages`);

/* 3. Review images, one per page */
const pages = pg.locator('.page');
const n = await pages.count();
for (let i = 0; i < n; i++) await pages.nth(i).screenshot({ path: path.join(reviewDir, `page-${String(i + 1).padStart(2, '0')}.png`) });
console.log(`review PNGs: ${n} in ${path.relative(root, reviewDir)}`);

await browser.close();
