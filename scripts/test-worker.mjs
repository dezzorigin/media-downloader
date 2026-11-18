// Unit test for public/_worker.js — the Cloudflare Pages edge proxy.
// The worker file is ES-module syntax (required by Pages Advanced Mode),
// so the test copies it to a .mjs temp file and imports that. Its fetch()
// is invoked directly with a stubbed global fetch that pretends to be
// downr.org, so no network is needed.
//   - GET /api/download without url -> 400
//   - GET /api/download?url=<bad> -> 500 with "Invalid url."
//   - GET /api/download?url=<ok> -> 200, shape {Status, Code, Input,
//     Endpoint, Result, Error}, Result from the stubbed download fn
//   - second identical call -> served from the worker cache (stub hit once)
//   - POST { url } also works
//   - non-/api path without ASSETS env -> 404
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const tmp = path.join(os.tmpdir(), `md-worker-test-${process.pid}.mjs`);
fs.copyFileSync(path.join(ROOT, 'public', '_worker.js'), tmp);
const worker = (await import(tmp)).default;
fs.unlinkSync(tmp);

let failures = 0;
function check(name, ok, extra = '') {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? ' — ' + extra : ''}`);
  if (!ok) failures++;
}

let downloadHits = 0;
const FIXTURE = {
  title: 'Stub Video',
  video_hd: 'https://cdn.example.com/v/hd.mp4',
  video_sd: 'https://cdn.example.com/v/sd.mp4',
};

globalThis.fetch = async (input) => {
  const url = String(input);
  if (url.includes('/.netlify/functions/analytics')) {
    return new Response('', {
      status: 200,
      headers: { 'set-cookie': 'sess=abc123; Path=/; HttpOnly' },
    });
  }
  if (url.includes('/.netlify/functions/download')) {
    downloadHits++;
    return new Response(JSON.stringify(FIXTURE), { status: 200 });
  }
  if (url.includes('/.netlify/functions/nyt')) {
    return new Response(JSON.stringify({ error: true }), { status: 500 });
  }
  throw new Error('unexpected fetch: ' + url);
};

const BASE = 'https://unduh-media.pages.dev';

// 1. missing url -> 400
{
  const res = await worker.fetch(new Request(`${BASE}/api/download`), {});
  const body = await res.json();
  check('missing url -> 400', res.status === 400, `got ${res.status}`);
  check('missing url body shape', body.Status === false && /required/i.test(body.Error || ''));
}

// 2. invalid url -> 500 Invalid url.
{
  const res = await worker.fetch(new Request(`${BASE}/api/download?url=not-a-url`), {});
  const body = await res.json();
  check('invalid url -> 500', res.status === 500, `got ${res.status}`);
  check('invalid url error message', body.Error === 'Invalid url.', `got ${body.Error}`);
}

// 3. valid url -> 200 with fixture result
{
  const res = await worker.fetch(
    new Request(`${BASE}/api/download?url=${encodeURIComponent('https://www.tiktok.com/@x/video/1')}`),
    {}
  );
  const body = await res.json();
  check('valid url -> 200', res.status === 200, `got ${res.status}`);
  check('shape Status true', body.Status === true);
  check('shape Code 200', body.Code === 200);
  check('shape Input echoes url', body.Input === 'https://www.tiktok.com/@x/video/1');
  check('shape Endpoint is download fn', String(body.Endpoint).includes('/.netlify/functions/download'));
  check('Result equals fixture', JSON.stringify(body.Result) === JSON.stringify(FIXTURE));
  check('Error null on success', body.Error === null);
  check('success sets s-maxage cache header', (res.headers.get('cache-control') || '').includes('s-maxage=180'));
}

// 4. second identical call -> cache, download fn hit only once total
{
  const before = downloadHits;
  const res = await worker.fetch(
    new Request(`${BASE}/api/download?url=${encodeURIComponent('https://www.tiktok.com/@x/video/1')}`),
    {}
  );
  const body = await res.json();
  check('cached call still 200 + Status true', res.status === 200 && body.Status === true);
  check('no second download hit (cache)', downloadHits === before, `hits ${before} -> ${downloadHits}`);
}

// 5. POST { url } also works
{
  const res = await worker.fetch(
    new Request(`${BASE}/api/download`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' }),
    }),
    {}
  );
  const body = await res.json();
  check('POST {url} -> 200 + Status true', res.status === 200 && body.Status === true);
}

// 6. non-API path without ASSETS -> 404
{
  const res = await worker.fetch(new Request(`${BASE}/`), {});
  check('non-API without ASSETS -> 404', res.status === 404, `got ${res.status}`);
}

if (failures > 0) {
  console.error(`\n${failures} worker test(s) failed`);
  process.exit(1);
}
console.log('\nworker test: all checks passed');
