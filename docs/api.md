# API — Media Downloader v1.1.0

Satu-satunya endpoint aplikasi. Dijalankan oleh edge worker Cloudflare
(`public/_worker.js`), bukan oleh Next.js.

## `GET /api/download?url=<URL>`

Mengekstrak tautan media dari URL halaman media sosial.

### Parameter

| Nama | Wajib | Keterangan |
|---|---|---|
| `url` | Ya | URL lengkap halaman (`https://…`). |

### Respons sukses (ekstraksi berhasil)

```json
{
  "Status": true,
  "Code": 200,
  "Input": "https://www.tiktok.com/@contoh/video/123",
  "Endpoint": "https://downr.org/.netlify/functions/download",
  "Result": { "...": "objek dari downr.org — berisi tautan media" },
  "Error": null
}
```

Header sukses: `Cache-Control: s-maxage=180, stale-while-revalidate=300`.

Bentuk `Result` **tidak dijamin** — isinya apa pun yang dikembalikan
downr.org (biasanya objek berisi judul, penulis, thumbnail, dan tautan
video/audio dengan berbagai kualitas). Klien (`app/page.tsx`) tidak
mengasumsikan skema apa pun: ia memindai `Result` secara rekursif dan
mengumpulkan semua nilai string yang berbentuk URL.

### Respons gagal

```json
{
  "Status": false,
  "Code": 502,
  "Input": "https://www.tiktok.com/@contoh/video/123",
  "Endpoint": "https://downr.org/.netlify/functions/nyt",
  "Result": null,
  "Error": "pesan error dari layanan / HTTP <status>"
}
```

`Endpoint` menunjukkan endpoint downr.org terakhir yang dicoba
(`download` atau `nyt`).

### Error klien

| Status | Kondisi |
|---|---|
| 400 | Parameter `url` tidak ada. Body: `{ Status: false, Error: "URL is required" }`. |
| 405 | Method selain GET/POST. |
| 500 | URL tidak valid (`"Invalid url."`) atau kegagalan internal worker. |

## `POST /api/download`

Sama seperti GET, dengan body JSON `{ "url": "<URL>" }`.

## Alur di dalam worker

1. Validasi URL.
2. Cache in-memory 10 menit (per isolate) + coalescing permintaan bersamaan.
3. Cookie handshake: `GET https://downr.org/.netlify/functions/analytics`
   (2× percobaan).
4. `POST https://downr.org/.netlify/functions/download` `{url}`
   (timeout 25 dtk, User-Agent dirotasi). Gagal → ulangi sekali.
5. Masih gagal → `POST https://downr.org/.netlify/functions/nyt`.
6. Penilaian sukses mengikuti aturan lama: status 2xx, data tidak kosong,
   bukan `"error"`/`"failed"`/`"user_retry_required"`, dan tidak ada
   flag `error`/`status: false`/`success: false`.

## Ketergantungan

Endpoint ini sepenuhnya bergantung pada **downr.org** (layanan pihak
ketiga, Netlify functions). Bila layanan itu mati, lambat, atau mengubah
format, endpoint mengembalikan `Status: false` dengan pesan apa adanya.

## Contoh (curl, dari jaringan biasa)

```bash
curl "https://unduh-media.pages.dev/api/download?url=https://www.tiktok.com/@tiktok/video/7405258093173181729"
```

Tanpa parameter `url`, responsnya harus JSON 400 — ini juga cara cepat
memeriksa worker Pages aktif (bila yang kembali 404 halaman, worker
tidak jalan).
