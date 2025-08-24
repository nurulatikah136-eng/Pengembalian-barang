console.log("Sistem Pengembalian Barang dimulakan.");

/***** CONFIG *****/
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyvBZOoFDOgUHypyTZ3R93S68rJu_N-6ZA949g-fxwlULgRFNFRCnquU7Y-wmYLLN-q/exec"; // Ganti dengan Current web app URL Apps Script

/***** DOM references *****/
const form = document.getElementById("returnForm");
const resultDiv = document.getElementById("result");
const submitBtn = document.getElementById("submitBtn");

const imageInput = document.getElementById("image");
const imagePreview = document.getElementById("imagePreview");
const addImageBtn = document.getElementById("addImageBtn");

let imageBase64 = "";
let submitting = false;

/***** Helper UI functions *****/
function showResult(msg, ok = true) {
  resultDiv.className = ok ? "result-ok" : "result-err";
  resultDiv.innerHTML = msg;
}

function setSubmitting(state) {
  submitting = state;
  submitBtn.disabled = state;
  submitBtn.textContent = state ? "Menghantar..." : "Hantar";
}

/***** Image handling & compression *****/
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
  const ratio = Math.min(maxWidth / img.width, maxHeight / img.height, 1);
  const canvas = document.createElement("canvas");
  canvas.width = img.width * ratio;
  canvas.height = img.height * ratio;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL(file.type, quality);
}

/***** Events: pilih gambar *****/
addImageBtn.addEventListener("click", () => imageInput.click());

imageInput.addEventListener("change", async () => {
  const file = imageInput.files[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    return showResult("❌ Fail bukan gambar", false);
  }

  imageBase64 = await compressImage(file);
  imagePreview.src = imageBase64;
  imagePreview.style.display = "block";
  addImageBtn.textContent = "Tukar Gambar";
  showResult("📸 Gambar dimuatkan", true);
});

/***** Event: submit borang *****/
form.addEventListener("submit", async e => {
  e.preventDefault();
  if (submitting) return;

  // Kumpul semua nilai borang
  const payload = Object.fromEntries(new FormData(form));
  if (imageBase64) payload.image = imageBase64;

  try {
    setSubmitting(true);
    showResult("⏳ Menghantar data...");

    // 📌 Inilah bahagian fetch ke Apps Script
    const res = await fetch(SCRIPT_URL, {
      method: "POST",                                 // method POST
      headers: { "Content-Type": "application/json" },// hantar sebagai JSON
      body: JSON.stringify(payload)                   // data borang dalam format JSON
    });
    console.log("Status:", res.status); // log status untuk debug

    const data = await res.json();
    console.log("Respons:", data); // log respons untuk debug

    if (data && data.success) {
      const link = data.imageUrl ? `<br>📸 <a href="${data.imageUrl}" target="_blank" rel="noopener">Lihat Gambar</a>` : "";
      showResult("✅ Berjaya hantar!" + link, true);

      // Reset borang & gambar
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
