# InaWIS V2 Soft Launch — Formulir Evaluasi

Formulir evaluasi web (Bahasa Indonesia) untuk soft launch InaWIS V2, dengan penyimpanan otomatis ke file JSON di folder `submissions/`.

## File

- `index.html` — halaman formulir.
- `recap.html` — halaman rekap seluruh feedback yang telah dikirim (dashboard).
- `server.rb` — server lokal (Ruby) yang menyimpan submission ke `submissions/` dan menyajikannya ke halaman recap.
- `Code.gs` — (opsional) backend Google Apps Script untuk integrasi Google Sheets.

## Cara menjalankan (server lokal)

1. Pastikan **Ruby** terpasang (cek dengan `ruby --version`).
2. Jalankan server:
   ```
   ruby server.rb
   ```
3. Buka di browser:
   - Form: http://localhost:8080/index.html
   - Rekap: http://localhost:8080/recap.html

Setiap kali form dikirim, server menyimpan satu file JSON baru ke folder `submissions/` dengan nama `YYYYMMDD-HHMMSS-nama.json`. Halaman recap membaca seluruh file di folder tersebut dan menampilkannya sebagai tabel + statistik.

> **Penting**: halaman form & recap harus dibuka melalui `http://localhost:8080/...` (bukan `file://`) agar bisa menyimpan/membaca file JSON. Jika server tidak berjalan, form akan fallback ke localStorage browser.

## Struktur file JSON submission

```json
{
  "submittedAt": "2026-11-20T12:26:43.000Z",
  "filename": "20261120-052643-test-server-user.json",
  "data": {
    "section1": { ... },
    "section2": { ... },
    "section3": [ { ... } ],
    "section4": { ... }
  }
}
```

## Integrasi Google Sheets (opsional)

Jika ingin menyimpan ke Google Sheets (seperti Google Forms) alih-alih file JSON, ikuti langkah di bawah:

1. **Buat spreadsheet baru** di https://sheets.new (mis. beri nama "InaWIS V2 Feedback").

2. **Buka Apps Script**: di spreadsheet, klik menu **Extensions → Apps Script**.

3. **Tempel kode**: hapus isi editor, lalu tempel seluruh isi `Code.gs`. Simpan (Ctrl+S).

4. **Buat header kolom**: pilih fungsi `setup` pada dropdown, klik **Run**, lalu izinkan akses saat diminta.

5. **Deploy sebagai Web App**:
   - Klik **Deploy → New deployment**.
   - Pilih type **Web app**.
   - *Execute as*: **Me**
   - *Who has access*: **Anyone**
   - Klik **Deploy**, lalu salin **Web app URL**.

6. **Hubungkan ke form**: buka `index.html`, cari baris:
   ```js
   const APPS_SCRIPT_URL = '/api/submit';
   ```
   Ganti dengan Web app URL, contoh:
   ```js
   const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycb.../exec';
   ```

7. **Hubungkan ke halaman rekap**: buka `recap.html`, cari baris yang sama
   (`const APPS_SCRIPT_URL = '/api/submissions';`) dan tempel Web app URL yang sama.

## Struktur kolom spreadsheet (mode Google Sheets)

| Kolom | Isi |
|-------|-----|
| Timestamp | Waktu pengiriman |
| Nama Lengkap | Section 1 |
| UPT / Instansi | Section 1 |
| Jabatan / Peran | Section 1 |
| Perangkat | Section 1 |
| Koneksi Internet | Section 1 |
| Pernah V1 | Section 1 |
| Tujuan | Section 2 (digabung koma) |
| Relevansi (1-5) | Section 2 |
| Performa Loading | Section 2 |
| Kemudahan Search/Layers/Legend/Slider (1-5) | Section 2 |
| Fitur | Section 3 (per feedback) |
| Jenis Feedback | Section 3 |
| Deskripsi | Section 3 |
| Harapan | Section 3 |
| Urgensi | Section 3 |
| Lampiran | Section 3 (nama file) |
| Prioritas | Section 4 |
| Dihubungi | Section 4 |
| Kontak | Section 4 |

> Catatan: karena satu pengiriman bisa berisi banyak feedback (Section 3), data Section 1, 2, dan 4 akan **terduplikasi** pada setiap baris feedback. Ini disengaja agar setiap baris berdiri sendiri dan mudah difilter/dianalisis di spreadsheet.

## Catatan keamanan

- Server lokal (`server.rb`) hanya berjalan di `127.0.0.1` (localhost), sehingga tidak bisa diakses dari luar komputer Anda.
- Lampiran (screenshot) saat ini hanya menyimpan **nama file**, bukan isi file. Untuk mengunggah file sungguhan, perlu endpoint upload terpisah.
