// Builds dist/artifact.html: a single-file version of index.html (CSS + JS inlined)
// for publishing as a claude.ai Artifact. Asset paths stay relative (published via `files`).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const html = readFileSync('index.html', 'utf8');
const css = readFileSync('styles.css', 'utf8');
const js = readFileSync('main.js', 'utf8');

const title = html.match(/<title>([\s\S]*?)<\/title>/)[1];
const fonts = html.match(/<link href="https:\/\/fonts\.googleapis\.com[^>]*>/)[0];
const body = html.match(/<body>([\s\S]*)<\/body>/)[1]
  .replace(/<script src="main\.js"><\/script>\s*/, '');

const out = `<title>${title}</title>
${fonts}
<style>
${css}
</style>
${body}
<script>
${js}
</script>
`;
mkdirSync('dist', { recursive: true });
writeFileSync('dist/artifact.html', out);
console.log('dist/artifact.html', out.length, 'bytes');
