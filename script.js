console.log("Sistem Pengembalian Barang dimulakan.");

const imageInput = document.getElementById("image");
const addImageBtn = document.getElementById("addImageBtn");
const imagePreview = document.getElementById("imagePreview");
let imageBase64 = "";

// Button untuk trigger pilih gambar
addImageBtn.addEventListener("click", function() {
  imageInput.click();
});

// Preview gambar
imageInput.addEventListener("change", function() {
  if (imageInput.files && imageInput.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      imagePreview.src = e.target.result;
      imagePreview.style.display = "block";
      imageBase64 = e.target.result; // base64 image string
    };
    reader.readAsDataURL(imageInput.files[0]);
  }
});

document.getElementById("form-barang").addEventListener("submit", function(e) {
  e.preventDefault();

  const data = {
    nama: document.getElementById("nama").value,
    telefon: document.getElementById("telefon").value,
    matrik: document.getElementById("matrik").value,
    universiti: document.getElementById("universiti").value,
    lokasi: document.getElementById("lokasi").value,
    tarikh_hantar: document.getElementById("tarikh_hantar").value,
    nota: document.getElementById("nota").value,
    image: imageBase64 // base64 string, kosong jika tiada gambar
  };

  fetch("https://script.google.com/macros/s/AKfycby5N0bXpzVXa87_BXWoixu0V29ZuKrwe5oZzaqef0e5EyDEtrkAw7Zx-m_-6aol6KlMDg/exec", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })
  .then(response => response.text())
  .then(result => {
    document.getElementById("result").innerText = result;
    document.getElementById("form-barang").reset();
    imagePreview.style.display = "none";
    imagePreview.src = "";
    imageBase64 = "";
  })
  .catch(error => {
    document.getElementById("result").innerText = "Ralat: " + error;
  });
});
