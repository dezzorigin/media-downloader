// Smoke test for the static export (runs in CI after `npm run build`).
// Checks the built output in out/ — no network needed.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, 'out');

let failures = 0;
function check(name, ok, extra = '') {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? ' — ' + extra : ''}`);
  if (!ok) failures++;
}

const indexHtml = path.join(OUT, 'index.html');
check('out/index.html exists', fs.existsSync(indexHtml));

let html = '';
if (fs.existsSync(indexHtml)) {
  html = fs.readFileSync(indexHtml, 'utf8');
  check('index.html is an app shell (Next.js static export)', html.length > 500);
}

// Landing markers live in the JS chunks for a Next.js static export —
// index.html is only a shell, so grep the whole output.
let js = '';
for (const f of walk(OUT)) {
  if (f.endsWith('.js')) js += fs.readFileSync(f, 'utf8');
}
function walk(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}
for (const marker of [
  'Lihat di GitHub',
  'github.com/dezzorigin/media-downloader',
  'Buka Downloader',
  'Lihat contoh hasil',
  'Universal Media Downloader',
  'Cara Kerja',
  'Platform yang didukung',
]) {
  check(`marker in built JS: "${marker}"`, js.includes(marker));
}

// The edge worker must ship with the static export (public/ -> out/).
check('out/_worker.js exists (edge proxy for /api/download)', fs.existsSync(path.join(OUT, '_worker.js')));
if (fs.existsSync(path.join(OUT, '_worker.js'))) {
  const worker = fs.readFileSync(path.join(OUT, '_worker.js'), 'utf8');
  check('_worker.js handles /api/download', worker.includes('/api/download'));
  check('_worker.js serves static assets via ASSETS', worker.includes('env.ASSETS'));
  check('_worker.js proxies to downr.org', worker.includes('downr.org'));
}

// PWA files
check('out/manifest.json exists', fs.existsSync(path.join(OUT, 'manifest.json')));
check('out/sw.js exists', fs.existsSync(path.join(OUT, 'sw.js')));
check('out/icon-192.svg exists', fs.existsSync(path.join(OUT, 'icon-192.svg')));

// No leftover template claims in the shipped bundle.
for (const bad of ['SANN404', 'SANN FORUM', 'npm install', 'MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API', 'ai-studio-applet']) {
  check(`no leftover "${bad}" in built output`, !js.includes(bad) && !html.includes(bad));
}

// package.json must not reintroduce the removed dead deps.
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const allDeps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
for (const dead of ['@google/genai', '@hookform/resolvers', 'axios', 'firebase-tools', '@tailwindcss/typography', 'class-variance-authority', 'clsx', 'tailwind-merge', 'tw-animate-css']) {
  check(`dead dep removed: ${dead}`, !(dead in allDeps));
}

if (failures > 0) {
  console.error(`\n${failures} smoke check(s) failed`);
  process.exit(1);
}
console.log('\nsmoke: all checks passed');
