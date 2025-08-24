console.log("Sistem Pengembalian Barang dimulakan.");

/***** CONFIG - Ganti dengan URL Web App kau *****/
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyvBZOoFDOgUHypyTZ3R93S68rJu_N-6ZA949g-fxwlULgRFNFRCnquU7Y-wmYLLN-q/exec";

/***** DOM refs *****/
const form = document.getElementById("returnForm");
const resultDiv = document.getElementById("result");
const submitBtn = document.getElementById("submitBtn");

const imageInput = document.getElementById("image");
const imagePreview = document.getElementById("imagePreview");
const addImageBtn = document.getElementById("addImageBtn");

let imageBase64 = ""; // akan diisi selepas compress
let submitting = false;

/***** Helpers UI *****/
function showResult(msg, ok = true) {
  resultDiv.classList.remove("result-ok", "result-err");
  resultDiv.classList.add(ok ? "result-ok" : "result-err");
  resultDiv.innerHTML = msg;
}

function setSubmitting(state) {
  submitting = state;
  submitBtn.disabled = state;
  submitBtn.textContent = state ? "Menghantar..." : "Hantar";
}

/***** Validasi *****/
function isValidMsPhone(num) {
  // Benarkan 01X dan panjang 9-11 digit (dgn/tnpa sengkang/ruang)
  const normalized = (num || "").replace(/[^\d]/g, "");
  return /^01[0-46-9]\d{7,8}$/.test(normalized);
}

function isValidDateNotPast(dateStr) {
  if (!dateStr) return false;
  const sel = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return sel >= today;
}

/***** Image handling *****/
addImageBtn.addEventListener("click", () => imageInput.click());

imageInput.addEventListener("change", async () => {
  const file = imageInput.files && imageInput.files[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    showResult("❌ Fail bukan imej yang sah.", false);
    imageInput.value = "";
    return;
  }

  // Had kasar 8MB untuk fail asal
  if (file.size > 8 * 1024 * 1024) {
    showResult("❌ Saiz gambar melebihi 8MB. Sila pilih gambar lebih kecil.", false);
    imageInput.value = "";
    return;
  }

  try {
    const { dataUrl, approxBytes } = await compressImage(file, {
      maxWidth: 1600,
      maxHeight: 1600,
      quality: 0.8
    });

    // Had selepas compress ~5MB
    if (approxBytes > 5 * 1024 * 1024) {
      showResult("❌ Gambar masih terlalu besar selepas pemampatan (>5MB).", false);
      imageInput.value = "";
      return;
    }

    imageBase64 = dataUrl;
    imagePreview.src = dataUrl;
    imagePreview.style.display = "block";
    addImageBtn.textContent = "Tukar Gambar";
    showResult("📸 Gambar dimuatkan.", true);
  } catch (err) {
    console.error(err);
    showResult("❌ Gagal memproses gambar.", false);
  }
});

function fileToImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function compressImage(file, { maxWidth = 1600, maxHeight = 1600, quality = 0.8 } = {}) {
  const img = await fileToImage(file);
  const { width, height } = img;

  // kira skala
  let targetW = width;
  let targetH = height;
  const ratio = Math.min(maxWidth / width, maxHeight / height, 1);
  targetW = Math.round(width * ratio);
  targetH = Math.round(height * ratio);

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, targetW, targetH);

  const mime = (file.type && file.type.startsWith("image/")) ? file.type : "image/jpeg";
  const dataUrl = canvas.toDataURL(mime, quality);

  // anggaran saiz dalam bait
  const approxBytes = Math.ceil((dataUrl.length - "data:image/png;base64,".length) * 3 / 4);

  return { dataUrl, approxBytes };
}

/***** Submit *****/
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (submitting) return;

  // Ambil nilai
  const nama = document.getElementById("nama").value.trim();
  const telefon = document.getElementById("telefon").value.trim();
  const matrik = document.getElementById("matrik").value.trim();
  const universiti = document.getElementById("universiti").value;
  const lokasi = document.getElementById("lokasi").value.trim();
  const tarikh_hantar = document.getElementById("tarikh_hantar").value;
  const nota = document.getElementById("nota").value.trim();

  // Validasi asas
  if (!isValidMsPhone(telefon)) {
    showResult("❌ Nombor telefon tidak sah (contoh: 0123456789).", false);
    return;
  }
  if (!isValidDateNotPast(tarikh_hantar)) {
    showResult("❌ Tarikh hantar tidak boleh tarikh lepas.", false);
    return;
  }

  const payload = { nama, telefon, matrik, universiti, lokasi, tarikh_hantar, nota };
  if (imageBase64) payload.image = imageBase64;

  try {
    setSubmitting(true);
    showResult("⏳ Menghantar data...", true);

    const res = await fetch(SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (data && data.success) {
      const link = data.imageUrl ? `<br>📸 <a href="${data.imageUrl}" target="_blank" rel="noopener">Lihat Gambar</a>` : "";
      showResult("✅ Berjaya hantar!" + link, true);

      form.reset();
      imagePreview.style.display = "none";
      imagePreview.src = "";
      imageBase64 = "";
      addImageBtn.textContent = "Add Image";
    } else {
      showResult("❌ Gagal: " + (data && data.message ? data.message : "Ralat tidak diketahui."), false);
    }
  } catch (err) {
    console.error(err);
    showResult("⚠️ Ralat rangkaian. Sila cuba lagi.", false);
  } finally {
    setSubmitting(false);
  }
});
