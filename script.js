console.log("Sistem Pengembalian Barang dimulakan.");

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbylpgQXbW1P8hYE2koWQ_zX6P3TyUk3eC0YslzvlYvU2Gl9Y4ke5PKbHMmJLHSPN9_S/exec";

// preview image
const imageInput = document.getElementById("image");
const imagePreview = document.getElementById("imagePreview");
let imageBase64 = "";

imageInput.addEventListener("change", function () {
  if (imageInput.files && imageInput.files[0]) {
    const reader = new FileReader();
    reader.onload = function (e) {
      imagePreview.src = e.target.result;
      imagePreview.style.display = "block";
      imageBase64 = e.target.result;
    };
    reader.readAsDataURL(imageInput.files[0]);
  }
});

// submit form
document.getElementById("returnForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = "⏳ Submitting...";

  try {
    const formData = new FormData(this);
    const payload = {};

    formData.forEach((value, key) => {
      payload[key] = value;
    });

    if (imageBase64) payload.image = imageBase64;

    const res = await fetch(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();

    if (data.success) {
      resultDiv.innerHTML = "✅ Berjaya submit! " +
        (data.imageUrl ? `<br>📸 <a href="${data.imageUrl}" target="_blank">View Image</a>` : "");
      this.reset();
      imagePreview.style.display = "none";
      imagePreview.src = "";
      imageBase64 = "";
    } else {
      resultDiv.innerHTML = "❌ Gagal: " + data.message;
    }
  } catch (err) {
    console.error(err);
    resultDiv.innerHTML = "⚠️ Error submit: " + err.message;
  }
});
