// ============================================================
// InaWIS V2 — Konfigurasi bersama (form & recap)
// ============================================================
// Tempel "Web app URL" dari Google Apps Script di sini (SATU kali).
// Setelah diisi, form akan menyimpan ke Google Sheets dan recap akan
// membacanya dari Google Sheets — cocok untuk deploy di GitHub Pages.
//
// Contoh:
//   APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycb.../exec'
//
// Jika dibiarkan kosong (''), halaman akan otomatis memakai:
//   - server lokal (server.rb) jika berjalan di http://localhost:8080
//   - localStorage sebagai fallback terakhir
// ============================================================
window.INWIS_CONFIG = {
  APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbxDXyJ0TW35IyKB3ksUMf2jMqhWdJFyVyOKsO-qCnh6bzUVrNUUH94xg6Z02MkAlUm5/exec'
};
