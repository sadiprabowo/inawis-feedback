/**
 * InaWIS V2 Soft Launch — Google Sheets backend
 * =============================================
 * Cara pakai (sekali saja):
 *   1. Buka https://sheets.new  → buat spreadsheet baru (mis. "InaWIS V2 Feedback").
 *   2. Di spreadsheet: Extensions → Apps Script.
 *   3. Hapus isi editor, tempel seluruh isi file ini, lalu Simpan.
 *   4. Jalankan fungsi `setup` sekali (pilih `setup` lalu klik Run) untuk
 *      membuat header kolom. Izinkan akses saat diminta.
 *   5. Deploy → New deployment → type "Web app":
 *        - Execute as: Me
 *        - Who has access: Anyone
 *      → Deploy → salin "Web app URL".
 *   6. Tempel URL tersebut ke konstanta APPS_SCRIPT_URL di index.html.
 *
 * Setiap kali form dikirim, setiap feedback (Section 3) menjadi SATU baris
 * baru di spreadsheet, persis seperti Google Forms menambah baris respons.
 */

var SHEET_NAME = 'Responses';

function setup() {
  var sheet = getSheet();
  var headers = [
    'Timestamp',
    'Nama Lengkap',
    'UPT / Instansi',
    'Jabatan / Peran',
    'Perangkat',
    'Koneksi Internet',
    'Pernah V1',
    'Tujuan',
    'Relevansi (1-5)',
    'Performa Loading',
    'Kemudahan Search (1-5)',
    'Kemudahan Layers (1-5)',
    'Kemudahan Legend (1-5)',
    'Kemudahan Slider (1-5)',
    'Fitur',
    'Jenis Feedback',
    'Deskripsi',
    'Harapan',
    'Urgensi',
    'Lampiran',
    'Prioritas',
    'Dihubungi',
    'Kontak'
  ];
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#0b3d66').setFontColor('#ffffff');
    sheet.setFrozenRows(1);
  }
  return 'Setup selesai. Header dibuat di sheet "' + SHEET_NAME + '".';
}

function getSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  return sheet;
}

function doGet(e) {
  // Endpoint baca data untuk halaman recap.
  // Mendukung ?action=recap untuk mengembalikan seluruh baris sebagai JSON.
  var params = (e && e.parameter) || {};
  if (params.action === 'recap') {
    return json({ ok: true, headers: getHeaders(), rows: readAll() });
  }
  return json({ ok: true, message: 'InaWIS V2 feedback endpoint aktif.' });
}

function getHeaders() {
  var sheet = getSheet();
  if (sheet.getLastRow() === 0) return [];
  return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
}

function readAll() {
  var sheet = getSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];
  var lastCol = sheet.getLastColumn();
  return sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);
  try {
    var payload = JSON.parse(e.postData.contents);
    var rows = flatten(payload);
    if (rows.length > 0) {
      var sheet = getSheet();
      sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
    }
    return json({ ok: true, rows: rows.length });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function flatten(p) {
  var s1 = p.section1 || {};
  var s2 = p.section2 || {};
  var kem = s2.kemudahan || {};
  var s4 = p.section4 || {};
  var feedbacks = p.section3 || [];

  var tujuan = Array.isArray(s2.tujuan) ? s2.tujuan.join(', ') : (s2.tujuan || '');

  return feedbacks.map(function (fb) {
    return [
      new Date(),
      s1.nama || '',
      s1.upt || '',
      s1.jabatan || '',
      s1.perangkat || '',
      s1.koneksi || '',
      s1.pernah_v1 || '',
      tujuan,
      s2.relevansi || '',
      s2.loading || '',
      kem.search || '',
      kem.layers || '',
      kem.legend || '',
      kem.slider || '',
      fb.fitur || '',
      fb.jenis_feedback || '',
      fb.deskripsi || '',
      fb.harapan || '',
      fb.urgensi || '',
      Array.isArray(fb.lampiran) ? fb.lampiran.join(', ') : (fb.lampiran || ''),
      s4.prioritas || '',
      s4.dihubungi || '',
      s4.kontak || ''
    ];
  });
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
