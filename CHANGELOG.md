# Changelog

Semua perubahan penting proyek ini dicatat di sini. Format mengikuti
[Keep a Changelog](https://keepachangelog.com/en/1.0.0/) dan
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] — 2026-11-18

Rebuild "proper": produk benar-benar jalan di Cloudflare Pages, dokumen ditulis
ulang dari isi repo yang sebenarnya.

### Added
- Landing ala SaaS (kunjungan pertama): navbar + logo GitHub kanan ke repo,
  hero dua kolom + pratinjau produk, fitur, cara kerja, daftar platform,
  catatan jujur, footer. Kunjungan berikut langsung masuk aplikasi
  (`localStorage: media-downloader-entered`).
- Edge worker `public/_worker.js` (Cloudflare Pages Advanced Mode) yang
  melayani `/api/download` — port logika `lib/downr.ts` ke runtime Workers:
  cookie handshake, POST download (2× percobaan), fallback NYT, cache
  10 menit, coalescing permintaan bersamaan.
- Mode demo ("Lihat contoh hasil"): kartu hasil dari `lib/demo-fixture.ts`,
  diberi badge "Data contoh" — bukan ekstraksi sungguhan.
- Unit test worker (`scripts/test-worker.mjs`, 16 cek, fetch di-stub) +
  smoke test hasil build (`scripts/smoke.mjs`).
- CI (`.github/workflows/ci.yml`): typecheck + lint + build, unit test
  worker, html-validate + markdown-link-check + smoke.
- Docs: PRD v2.0, `docs/architecture.md`, `docs/api.md`,
  `docs/diagram.svg`, screenshot + video demo (tanpa suara).
- Service worker yang benar-benar meng-cache aset statis (API selalu network).
- Ikon favicon via metadata (`/icon-192.svg`).

### Changed
- `next.config.ts`: `output: 'standalone'` → `output: 'export'`
  (static export untuk Cloudflare Pages direct upload); hapus hack HMR
  AI Studio. Gambar `unoptimized`.
- Input URL dari `type="url"` menjadi `type="text"` + `inputMode="url"`:
  validasi native browser sebelumnya memblokir pesan error aplikasi
  untuk URL tidak valid.
- Pesan error endpoint kini ramah: endpoint tidak merespons → "Layanan
  ekstraksi tidak merespons (HTTP …)".
- Metadata OpenGraph + deskripsi jujur; masuk aplikasi dari landing
  mereset form (hasil demo tidak menempel).

### Removed
- Popup "Stay Connected" yang mempromosikan channel WhatsApp SANN404
  FORUM (bukan milik proyek ini) + popup install yang muncul sendiri.
  Tombol "Install App" kini hanya muncul bila browser menawarkan instalasi.
- `app/api/download/route.ts` + `lib/downr.ts` (digantikan worker edge).
- Dependensi mati: `@google/genai` (tidak dipakai sama sekali — klaim
  "SERVER_SIDE_GEMINI_API" di `metadata.json` fiktif), `@hookform/resolvers`,
  `axios`, `firebase-tools`, `@tailwindcss/typography`,
  `class-variance-authority`, `clsx`, `tailwind-merge`, `tw-animate-css`.
  Paket terpasang 982 → 375.
- File mati: `lib/utils.ts`, `hooks/use-mobile.ts`, `metadata.json`,
  `.eslintrc.json` (legacy, flat config sudah ada).
- Klaim fiktif di README/PRD/CHANGELOG lama: "database", "multi-provider
  download", "magnet link / torrent", "concurrent download queue",
  "progress tracking", "enterprise-grade", "zero downtime", URL demo
  `3b8e5cbb.media-downloader-c5f.pages.dev` yang sudah tidak berlaku.

### Fixed
- Validasi URL tidak valid kini menampilkan pesan error aplikasi
  (sebelumnya diblokir validasi native browser tanpa pesan).
- `package.json` bernama `ai-studio-applet` → `media-downloader`.

## [1.0.0] — 2026 (template awal)

- Scaffolding AI Studio: Next.js + halaman downloader + proxy downr.org
  (`lib/downr.ts`, `app/api/download`), PWA manifest + service worker
  pass-through, README/PRD/CHANGELOG template.
- Tidak ada CI, docs, screenshot, video, atau deploy yang terverifikasi.
