# Return Form Repo

Ini adalah repo template untuk borang **Permintaan Penghantaran Balik Barang** student UNIMAS/UiTM.

## 📌 Setup

1. Upload file `return_form.html` ke GitHub repo baru.
2. Pergi ke **Settings > Pages** → enable GitHub Pages dari branch `main`.
3. Dapatkan link GitHub Pages: `https://username.github.io/repo-name/`.

## 🔗 Sambungan Google Sheets

1. Pergi ke [Google Apps Script](https://script.google.com/).
2. Buat project baru → paste code berikut:

```javascript
function doPost(e) {
  var ss = SpreadsheetApp.openByUrl("YOUR_GOOGLE_SHEET_URL");
  var ws = ss.getSheetByName("Sheet1");
  var data = JSON.parse(JSON.stringify(e.parameter));
  ws.appendRow([
    new Date(),
    data.nama,
    data.telefon,
    data.matrik,
    data.universiti,
    data.lokasi,
    data.tarikh_hantar,
    data.nota
  ]);
  return ContentService.createTextOutput("Success");
}
```

3. Deploy → pilih **Web App**, set `Anyone with link can access`.
4. Copy URL Web App → paste ke dalam `scriptURL` di `return_form.html`.

## 🚀 Done!

Sekarang student boleh isi form online, data terus masuk Google Sheets.
