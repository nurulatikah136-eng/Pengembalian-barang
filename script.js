console.log("Sistem Pengembalian Barang dimulakan.");

document.getElementById("form-barang").addEventListener("submit", function(e) {
  e.preventDefault();

  const data = {
    nama: document.getElementById("nama").value,
    telefon: document.getElementById("telefon").value,
    matrik: document.getElementById("matrik").value,
    universiti: document.getElementById("universiti").value,
    lokasi: document.getElementById("lokasi").value,
    tarikh_hantar: document.getElementById("tarikh_hantar").value,
    nota: document.getElementById("nota").value
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
  })
  .catch(error => {
    document.getElementById("result").innerText = "Ralat: " + error;
  });
});
