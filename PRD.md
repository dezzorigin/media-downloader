# PRD — Media Downloader v2.0

## 1. Informasi Proyek

| Field | Nilai |
|---|---|
| Nama Proyek | Media Downloader |
| Repo | github.com/dezzorigin/media-downloader |
| Live | https://unduh-media.pages.dev |
| Tech Stack | Next.js 15 (static export) + Cloudflare Pages + edge worker |
| Status | v1.1.0 — proper (18 Nov 2026) |
| Penanggung Jawab | Nabil Aulia Dika (dezzorigin) |
| Versi Dokumen | 2.0 |

## 2. Latar Belakang

Media Downloader adalah alat untuk mengambil tautan media (video/foto/audio) dari tautan halaman media sosial. Pengguna menempel tautan — mis. video TikTok — dan mendapat tautan berkas media aslinya, tanpa memasang aplikasi dan tanpa login.

Versi awal repo ini adalah template AI Studio: fungsi intinya (proxy ke downr.org) sudah ada, tapi dokumennya fiktif (PRD template, klaim database yang tidak ada, klaim Gemini yang tidak dipakai), dependensi mati menumpuk, dan tidak ada CI/deploy. Rebuild v1.1.0 membersihkan semuanya dan membuat produknya benar-benar jalan di Cloudflare Pages.

## 3. Masalah yang Diselesaikan

- Menyimpan video/foto dari media sosial biasanya butuh aplikasi pihak ketiga yang penuh iklan atau meminta login.
- Tautan media asli tersembunyi di balik halaman platform — pengguna awam tidak bisa mengambilnya sendiri.

## 4. Tujuan & Sasaran

- Satu kolom input → tautan media yang bisa diunduh, dalam hitungan detik.
- Tanpa akun, tanpa data pengguna yang disimpan.
- Jujur soal batas: ekstraksi bergantung pada layanan pihak ketiga (downr.org); kegagalan ditampilkan apa adanya, bukan disembunyikan.

## 5. Ruang Lingkup

### In Scope
- Landing ala SaaS (kunjungan pertama) + aplikasi downloader (kunjungan berikut langsung masuk aplikasi).
- Ekstraksi via edge worker `/api/download` (GET `?url=` / POST `{url}`) yang mem-proxy ke downr.org.
- Hasil sebagai kartu tautan + payload teknis mentah.
- Mode demo dengan data contoh berlabel.
- PWA: manifest + service worker (cache aset statis; API selalu network).
- CI hijau + docs lengkap + deploy live.

### Out of Scope
- Mengunduh/menyimpan berkas media di server kami (tautan dibuka langsung dari sumbernya).
- Akun pengguna, riwayat unduhan, antrean unduh.
- Bypass proteksi platform (DRM, konten privat, login wall).
- Layanan ekstraksi sendiri — downr.org adalah dependensi eksternal.

## 6. Fitur & Persyaratan Fungsional

| # | Fitur | Perilaku |
|---|---|---|
| F1 | Landing SaaS | Navbar + logo GitHub kanan, hero 2 kolom + pratinjau produk, fitur, cara kerja, daftar platform, catatan jujur, footer. |
| F2 | Masuk aplikasi | Tombol "Buka Downloader" menyimpan `media-downloader-entered=1` di localStorage; kunjungan berikut langsung masuk aplikasi. Tombol "← Landing" kembali ke landing. |
| F3 | Ekstraksi | Input URL → validasi format di klien → `GET /api/download?url=…` → kartu hasil. URL tidak valid ditolak dengan pesan jelas (bukan validasi native browser). |
| F4 | Kartu hasil | Setiap URL media dari respons ditampilkan sebagai kartu (label dari kunci respons, dibersihkan) + tombol "Access Media" (target `_blank`). |
| F5 | Payload teknis | `<details>` berisi JSON mentah respons ekstraksi. |
| F6 | Mode demo | "Lihat contoh hasil" menampilkan kartu dari `lib/demo-fixture.ts`, dengan badge "Data contoh" + penjelasan. Bukan ekstraksi sungguhan. |
| F7 | Cache & coalescing | Worker: cache 10 menit per URL + permintaan bersamaan yang sama digabung jadi satu. |
| F8 | Fallback endpoint | Worker mencoba `download` 2×, lalu `nyt`. |
| F9 | PWA install | Tombol "Install App" muncul hanya bila browser mengirim `beforeinstallprompt`. |
| F10 | Penanganan error | Endpoint tidak merespons / layanan gagal → pesan error ditampilkan, bukan layar kosong atau hang. |

## 7. Persyaratan Non-Fungsional

- **Performa:** static export; first load JS ~153 kB. Ekstraksi tergantung latensi downr.org (timeout 25 dtk per percobaan di worker).
- **Keamanan:** tidak ada secret di repo (`.env` di `.gitignore`, tidak ada `.env.example` karena tidak ada key yang dibutuhkan); tidak ada data pengguna yang disimpan; tautan dibuka dengan `rel="noopener noreferrer"`.
- **Kejujuran:** tidak ada klaim ketersediaan/uptime/layanan sendiri. Daftar platform = klaim downr.org. Testimoni/statistik tidak ada (tidak dikarang).
- **Maintainability:** worker tanpa dependensi (mudah diuji: `npm run test:worker` men-stub fetch); smoke test memeriksa hasil build.

## 8. Arsitektur & Tech Stack

Lihat [docs/architecture.md](docs/architecture.md) dan [docs/api.md](docs/api.md). Ringkasnya:

```
Browser ──► Pages (static export: landing + app)
   │            │
   │            └─ /api/download ──► _worker.js (edge)
   │                                     │ POST + cookie handshake
   └─ (tautan media langsung)             ▼
                                   downr.org (Netlify functions)
```

## 9. Milestone

| Fase | Status |
|---|---|
| Scaffolding template (AI Studio) | ✅ (sebelum rebuild) |
| Rebuild v1.1.0: landing SaaS, hapus popup channel, bersih-bersih dep fiktif | ✅ 18 Nov 2026 |
| Edge worker `/api/download` + unit test | ✅ 18 Nov 2026 |
| CI (typecheck+lint+build, worker test, landing checks) | ✅ 18 Nov 2026 |
| Deploy Pages + verifikasi live | ✅ 18 Nov 2026 |
| Verifikasi round-trip ekstraksi dari browser biasa | ⏳ (butuh cek manual — POST ke downr.org menggantung dari VM) |

## 10. Risiko & Mitigasi

| Risiko | Mitigasi |
|---|---|
| downr.org mati / memblokir / mengubah API | Pesan error ditampilkan apa adanya; mode demo tetap menunjukkan UI; tidak ada klaim uptime. |
| Platform mengubah halaman → ekstraksi gagal | Sama seperti di atas; daftar platform diberi catatan "mengikuti klaim downr.org". |
| Worker Pages tidak aktif saat deploy (`_worker.js` diabaikan) | Verifikasi live: `/api/download` tanpa `url` harus mengembalikan JSON 400 (bukan 404 halaman). Bila 404, deploy ulang / evaluasi ulang. |
| Penyalahgunaan (unduh konten berhak cipta) | Catatan jujur di landing + README; alat hanya mengekstrak tautan yang disediakan layanan pihak ketiga. |

## 11. Kriteria Keberhasilan

- Aplikasi berjalan tanpa error di lingkungan dev dan live.
- CI hijau di main.
- Play-test lokal 29/29 (landing, demo, validasi, error path, PWA, mobile).
- Unit test worker 16/16.
- README & PRD jujur dan up-to-date; tidak ada secret ter-commit.

## 12. Lampiran

- Arsitektur: [docs/architecture.md](docs/architecture.md)
- API: [docs/api.md](docs/api.md)
- Diagram: [docs/diagram.svg](docs/diagram.svg)
- Changelog: [CHANGELOG.md](CHANGELOG.md)
- Lisensi: MIT (LICENSE)
