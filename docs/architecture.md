# Arsitektur — Media Downloader v1.1.0

## Gambaran

Aplikasi ini **statis** — tidak ada server Node.js. Semua halaman adalah hasil
`next build` dengan `output: 'export'`, diunggah ke Cloudflare Pages. Satu-satunya
bagian yang "hidup" adalah edge worker (`public/_worker.js`) yang melayani
`/api/download`.

```
┌──────────┐   GET /            ┌─────────────────────┐
│ Browser  │ ────────────────►  │ Cloudflare Pages    │
│          │   GET /api/…       │  (static export)    │
│          │ ────────────────►  │  + _worker.js       │
└──────────┘                    └──────┬──────────────┘
  ▲                                    │ POST (server-side)
  │ tautan media langsung              ▼
  │                              ┌────────────┐
  └──────────────────────────── │ downr.org  │ (Netlify functions:
                                 │  download  │  analytics, download, nyt)
                                 └────────────┘
```

## Komponen

### 1. Frontend — `app/` (Next.js 15, React 19, Tailwind 4)

- `app/layout.tsx` — metadata (judul, deskripsi, OpenGraph, ikon, manifest),
  font Inter.
- `app/page.tsx` — satu-satunya halaman, dua tampilan:
  - **Landing** (state awal): navbar + logo GitHub, hero 2 kolom + pratinjau,
    fitur, cara kerja, platform, catatan jujur, footer.
  - **Aplikasi**: kartu input URL → `GET /api/download?url=…` → kartu hasil
    + payload teknis. Mode demo memakai `lib/demo-fixture.ts`.
- State `entered` disimpan di `localStorage` (`media-downloader-entered`).
  Kunjungan berikut langsung masuk aplikasi; tombol "← Landing" kembali.
- `lib/demo-fixture.ts` — data contoh berlabel (bukan hasil nyata).

### 2. Edge worker — `public/_worker.js` (Cloudflare Pages Advanced Mode)

File ini ikut ter-copy ke `out/_worker.js` saat build (karena di `public/`),
dan Pages menjalankannya sebagai worker untuk **semua** request:

- Path `/api/download` → logika ekstraksi (port dari `lib/downr.ts` lama).
- Path lain → `env.ASSETS.fetch(request)` (menyajikan file statis).

Logika ekstraksi (identik dengan implementasi server lama):

1. Validasi URL (`/^https?:\/\//`).
2. Cek cache in-memory (TTL 10 menit); gabungkan permintaan bersamaan yang sama.
3. `GET https://downr.org/.netlify/functions/analytics` untuk cookie (2× percobaan).
4. `POST …/functions/download` dengan `{url}`, header meniru browser desktop,
   User-Agent dirotasi (timeout 25 dtk). Gagal → ulangi sekali dengan cookie baru.
5. Masih gagal → `POST …/functions/nyt` (fallback).
6. Kembalikan bentuk respons yang sama seperti route Next.js lama:
   `{ Status, Code, Input, Endpoint, Result, Error }`.

Worker ini tanpa dependensi dan diuji tanpa jaringan
(`npm run test:worker` men-stub `fetch`).

### 3. Service worker — `public/sw.js`

- Runtime cache-first untuk aset same-origin (GET): app shell bisa dibuka
  offline setelah kunjungan pertama.
- `/api/*` selalu network-only — hasil ekstraksi tidak boleh disajikan basi.
- Versi cache `media-downloader-v1`; aktivasi menghapus cache lama.

### 4. CI — `.github/workflows/ci.yml`

| Job | Isi |
|---|---|
| `validate` | `npm ci` → typecheck → lint → build; hasil build diunggah sebagai artifact |
| `worker-test` | `npm run test:worker` (tanpa `npm install` — worker tanpa dependensi) |
| `landing` | unduh artifact → html-validate `out/index.html` → markdown-link-check README → `node scripts/smoke.mjs` |

Variasi dari repo Next.js sebelumnya: job `worker-test` yang menguji edge
worker secara unit (bukan cuma build + lighthouse).

## Keputusan penting

- **Static export + worker, bukan server Next.js.** Pages direct upload hanya
  melayani file statis. API route Next.js tidak bisa ikut — maka logikanya
  pindah ke `_worker.js`. Klien tidak berubah: tetap memanggil `/api/download`.
- **Tidak memanggil downr.org langsung dari browser.** Preflight CORS ke
  downr.org tidak mengembalikan `Access-Control-Allow-Origin`, jadi fetch
  lintas origin akan diblokir browser. Proxy server-side (worker) adalah
  satu-satunya jalan.
- **Tidak membuat layanan ekstraksi sendiri.** downr.org adalah dependensi
  eksternal yang tidak dikontrol proyek ini — didokumentasikan jujur di
  README/PRD/landing.
- **Dependensi dipangkas** dari 982 → 375 paket: semua yang tidak diimpor
  (`@google/genai`, `axios`, `firebase-tools`, dsb.) dibuang.

## Batasan yang diketahui

- Round-trip ekstraksi nyata **tidak bisa diverifikasi dari VM pengembangan**:
  POST ke downr.org menggantung (000) dari jaringan egress VM, sementara GET
  ke downr.org normal. Perlu satu kali cek dari browser biasa di situs live.
- Worker Pages gratis punya batas waktu eksekusi; timeout per percobaan
  25 dtk dipilih supaya tidak menabrak batas itu.
- Cache worker bersifat per-isolate (in-memory) — bukan cache global.
- Foto `picsum.photos` dipakai di fixture demo (thumbnail/cover contoh).
