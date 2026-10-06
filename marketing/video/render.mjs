// Renders the launch video in all three formats (plus a cover still each) with the installed Chromium.
//   node render.mjs                      → all compositions, full length
//   node render.mjs LaunchSquare         → one composition
//   node render.mjs LaunchSquare --quick → first 2 seconds at low quality (smoke test)
//   node render.mjs --stills             → only the cover stills (frames for review)
import path from 'node:path';
import { mkdirSync } from 'node:fs';
import { bundle } from '@remotion/bundler';
import { renderMedia, renderStill, selectComposition } from '@remotion/renderer';

const ALL = ['LaunchSquare', 'LaunchVertical', 'LaunchLandscape'];
const args = process.argv.slice(2);
const quick = args.includes('--quick');
const stillsOnly = args.includes('--stills');
const ids = args.filter(a => !a.startsWith('--'));
const targets = ids.length ? ids : ALL;
const browserExecutable = process.env.CHROME_PATH || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const REVIEW_FRAMES = [40, 150, 300, 440, 540, 690];

mkdirSync('out', { recursive: true });
console.log('bundling…');
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts'), publicDir: path.resolve('public') });

for (const id of targets) {
  const composition = await selectComposition({ serveUrl, id, browserExecutable });
  if (!stillsOnly) {
    const out = `out/${id}${quick ? '-quick' : ''}.mp4`;
    let last = -1;
    await renderMedia({
      composition, serveUrl, codec: 'h264', outputLocation: out, browserExecutable,
      concurrency: 3, crf: quick ? 28 : 18, imageFormat: 'jpeg', jpegQuality: quick ? 70 : 92,
      frameRange: quick ? [0, 59] : undefined,
      onProgress: ({ progress }) => { const p = Math.floor(progress * 10); if (p !== last) { last = p; process.stdout.write(`${id} ${p * 10}%\n`); } },
    });
    console.log('wrote', out);
  }
  for (const frame of (quick ? [40] : REVIEW_FRAMES)) {
    const output = `out/stills/${id}-f${frame}.png`;
    mkdirSync('out/stills', { recursive: true });
    await renderStill({ composition, serveUrl, output, frame, browserExecutable, imageFormat: 'png' });
  }
  console.log('stills for', id);
}
console.log('done');
