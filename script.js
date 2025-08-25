console.log("Sistem dimulakan.  Untitled1:1 - script.js:1");

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwJ7v6Wds_RUv4FzpLlTg-71gxNhuRUtx6MD-OXuDL1Tpk-LUNkMX9i_fBPSXgs35kNmg/exec"; // Ganti dengan URL Web App dari Apps Script

const form = document.getElementById("returnForm");
const resultDiv = document.getElementById("result");
const submitBtn = document.getElementById("submitBtn");
const imageInput = document.getElementById("image");
const imagePreview = document.getElementById("imagePreview");
const addImageBtn = document.getElementById("addImageBtn");
const toggleBtn = document.getElementById("toggleTheme");

let imageBase64 = "";
let submitting = false;

toggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

addImageBtn.addEventListener("click", () => imageInput.click());

imageInput.addEventListener("change", () => {
  const file = imageInput.files[0];
  if (!file || !file.type.startsWith("image/")) return;
  const reader = new FileReader();
  reader.onload = e => {
    imageBase64 = e.target.result;
    imagePreview.src = imageBase64;
    imagePreview.style.display = "block";
  };
  reader.readAsDataURL(file);
});

form.addEventListener("submit", async e => {
  e.preventDefault();
  if (submitting) return;

  const payload = Object.fromEntries(new FormData(form));
  if (imageBase64) payload.image = imageBase64;

  try {
    submitting = true;
    submitBtn.disabled = true;
    submitBtn.textContent = "Menghantar...";
    resultDiv.innerHTML = "⏳ Menghantar data...";

    const res = await fetch (SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (data.success) {
      resultDiv.innerHTML = `✅ Berjaya! <br><a href="${data.imageUrl}" target="_blank">Lihat Gambar</a>`;
      form.reset();
      imagePreview.style.display = "none";
      imageBase64 = "";
    } else {
      resultDiv.innerHTML = "❌ Gagal: " + data.message;
    }
  } catch (err) {
    resultDiv.innerHTML = "⚠️ Ralat rangkaian.";
  } finally {
    submitting = false;
    submitBtn.disabled = false;
    submitBtn.textContent = "📤 Hantar Permintaan";
  }
});
