/**
 * Cloudflare Pages Advanced-Mode worker (`_worker.js`).
 *
 * Serves two jobs:
 *  1. `/api/download` — extraction proxy. The static site has no server, so
 *     this worker runs the old `lib/downr.ts` logic on the edge: it asks the
 *     third-party downr.org service to extract media links from a pasted
 *     social-media URL (cookie handshake -> POST download -> retry -> NYT
 *     fallback), with a 10-minute in-memory cache and in-flight coalescing.
 *  2. Everything else — served from the static asset bundle via ASSETS.
 *
 * Response shape (identical to the old Next.js route, so the client is
 * unchanged):
 *   { Status, Code, Input, Endpoint, Result, Error }
 *
 * Honest limits: extraction depends entirely on downr.org, a third-party
 * service this project does not control. If downr.org is slow, blocks the
 * request, or drops support for a platform, extraction fails and the client
 * shows the error verbatim. No media is stored here.
 */

const BASE = 'https://downr.org';
const ANALYTICS = `${BASE}/.netlify/functions/analytics`;
const DOWNLOAD = `${BASE}/.netlify/functions/download`;
const NYT = `${BASE}/.netlify/functions/nyt`;

const UAS = [
  'Mozilla/5.0 (Linux; Android 15; SM-F958 Build/AP3A.240905.015) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.6723.86 Mobile Safari/537.36',
  'Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Mobile Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Linux; Android 13; Pixel 7 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36',
];

const FETCH_TIMEOUT_MS = 25000;
const CACHE_TTL_MS = 1000 * 60 * 10; // 10 minutes, same as the old server lib

const cache = new Map(); // url -> { data, expiresAt }
const pending = new Map(); // url -> Promise

function randomUA() {
  return UAS[Math.floor(Math.random() * UAS.length)];
}

function headers(cookie = '') {
  return {
    accept: '*/*',
    'accept-encoding': 'gzip, deflate, br',
    'accept-language': 'en-US,en;q=0.9',
    'content-type': 'application/json',
    cookie,
    origin: BASE,
    referer: `${BASE}/`,
    'sec-ch-ua': '"Chromium";v="130", "Not?A_Brand";v="99"',
    'sec-ch-ua-mobile': '?1',
    'sec-ch-ua-platform': '"Android"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'user-agent': randomUA(),
  };
}

function parseCookie(setCookie) {
  if (!setCookie) return '';
  return setCookie.split(',').map((v) => v.split(';')[0].trim()).join('; ');
}

function parseData(data) {
  if (typeof data !== 'string') return data;
  const text = data.trim();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function isOk(status, data) {
  const isObject = data && typeof data === 'object';
  if (status < 200 || status >= 300) return false;
  if (data === null || data === undefined) return false;
  if (data === '') return false;
  if (data === 'error' || data === 'failed' || data === 'user_retry_required') return false;
  if (isObject && data.error === true) return false;
  if (isObject && data.status === false) return false;
  if (isObject && data.success === false) return false;
  return true;
}

function getError(data, status) {
  if (typeof data === 'string') return data || `HTTP ${status}`;
  if (data && typeof data === 'object') {
    return data.message || data.error || data.status || data.reason || `HTTP ${status}`;
  }
  return `HTTP ${status}`;
}

async function getCookie(retries = 2) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(ANALYTICS, {
        method: 'GET',
        headers: headers(),
        signal: AbortSignal.timeout(10000),
      });
      return parseCookie(res.headers.get('set-cookie') || '');
    } catch {
      if (i === retries - 1) return '';
    }
  }
  return '';
}

async function postEndpoint(endpoint, url, cookie = '') {
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: headers(cookie),
      body: JSON.stringify({ url }),
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    const text = await res.text();
    return { endpoint, status: res.status, data: parseData(text) };
  } catch (err) {
    return { endpoint, status: 500, data: null, error: String(err && err.message ? err.message : err) };
  }
}

async function tryDownload(url) {
  let cookie = await getCookie();
  let result = await postEndpoint(DOWNLOAD, url, cookie);
  if (isOk(result.status, result.data)) return result;

  cookie = await getCookie();
  result = await postEndpoint(DOWNLOAD, url, cookie);
  if (isOk(result.status, result.data)) return result;

  result = await postEndpoint(NYT, url, cookie);
  return result;
}

async function downr(url) {
  if (!url || !/^https?:\/\//i.test(url)) {
    throw new Error('Invalid url.');
  }

  const cached = cache.get(url);
  if (cached) {
    if (Date.now() < cached.expiresAt) return cached.data;
    cache.delete(url);
  }

  if (pending.has(url)) return await pending.get(url);

  const requestPromise = (async () => {
    const result = await tryDownload(url);
    const ok = isOk(result.status, result.data);
    const finalOutput = {
      Status: ok,
      Code: result.status,
      Input: url,
      Endpoint: result.endpoint,
      Result: ok ? result.data : null,
      Error: ok ? null : getError(result.data, result.status),
    };
    if (ok) cache.set(url, { data: finalOutput, expiresAt: Date.now() + CACHE_TTL_MS });
    return finalOutput;
  })();

  pending.set(url, requestPromise);
  try {
    return await requestPromise;
  } finally {
    pending.delete(url);
  }
}

function json(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...extraHeaders },
  });
}

async function handleDownload(request) {
  let url = null;
  if (request.method === 'GET') {
    url = new URL(request.url).searchParams.get('url');
  } else if (request.method === 'POST') {
    try {
      const body = await request.json();
      url = body && body.url ? body.url : null;
    } catch {
      url = null;
    }
  } else {
    return json({ Status: false, Error: 'Method not allowed' }, 405);
  }

  if (!url) return json({ Status: false, Error: 'URL is required' }, 400);

  try {
    const result = await downr(url);
    const headers = {};
    if (result.Status) headers['Cache-Control'] = 's-maxage=180, stale-while-revalidate=300';
    return json(result, 200, headers);
  } catch (err) {
    return json({ Status: false, Error: (err && err.message) || 'Failed to process request' }, 500);
  }
}

const worker = {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (pathname === '/api/download') return handleDownload(request);
    if (env && env.ASSETS) return env.ASSETS.fetch(request);
    return new Response('Not Found', { status: 404 });
  },
};

export default worker;
