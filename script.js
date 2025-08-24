console.log("Sistem Pengembalian Barang dimulakan.");

/***** CONFIG *****/
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyvBZOoFDOgUHypyTZ3R93S68rJu_N-6ZA949g-fxwlULgRFNFRCnquU7Y-wmYLLN-q/exec"; // Ganti dengan URL Web App dari Apps Script

/***** DOM refs *****/
const form = document.getElementById("returnForm");
const resultDiv = document.getElementById("result");
const submitBtn = document.getElementById("submitBtn");
const imageInput = document.getElementById("image");
const imagePreview = document.getElementById("imagePreview");
const addImageBtn = document.getElementById("addImageBtn");

let imageBase64 = "";
let submitting = false;

function showResult(msg, ok = true) {
  resultDiv.className = ok ? "result-ok" : "result-err";
  resultDiv.innerHTML = msg;
}

function setSubmitting(state) {
  submitting = state;
  submitBtn.disabled = state;
  submitBtn.textContent = state ? "Menghantar..." : "Hantar";
}

// Pilih gambar
addImageBtn.addEventListener("click", () => imageInput.click());

imageInput.addEventListener("change", () => {
  const file = imageInput.files[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    showResult("❌ Fail bukan gambar", false);
    return;
  }
  const reader = new FileReader();
  reader.onload = e => {
    imageBase64 = e.target.result;
    imagePreview.src = imageBase64;
    imagePreview.style.display = "block";
  };
  reader.readAsDataURL(file);
});

// Submit
form.addEventListener("submit", async e => {
  e.preventDefault();
  if (submitting) return;

  const payload = Object.fromEntries(new FormData(form));
  if (imageBase64) payload.image = imageBase64;

  try {
    setSubmitting(true);
    showResult("⏳ Menghantar data...");

    const res = await fetch(SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (data.success) {
      const link = data.imageUrl ? `<br>📸 <a href="${data.imageUrl}" target="_blank">Lihat Gambar</a>` : "";
      showResult("✅ Berjaya submit!" + link, true);
      form.reset();
      imagePreview.style.display = "none";
      imagePreview.src = "";
      imageBase64 = "";
    } else {
      showResult("❌ Gagal: " + data.message, false);
    }
  } catch (err) {
    console.error(err);
    showResult("⚠️ Ralat rangkaian. Sila cuba lagi.", false);
  } finally {
    setSubmitting(false);
  }
});
