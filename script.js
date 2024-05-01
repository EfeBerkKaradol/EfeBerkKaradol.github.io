const key =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnYWZjdHpvZG9ldnVud216bXd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTMxODA5MDIsImV4cCI6MjAyODc1NjkwMn0.JrzXWG5raNMCAb3wEBv1aCxE0R9P5-TWLQy-uITewDU";
const url = "https://bgafctzodoevunwmzmwx.supabase.co";
const database = supabase.createClient(url, key);

// Fonksiyonlarımızı tanımlayalım

// Kişileri adlarına veya sürücü belge numarasına göre arayın
function searchPeople(query) {
  // supabase nesnesi tanımlı değilse veya boşsa, işlem yapmadan önce kontrol edelim
  if (!database || query.trim() === "") {
    console.error("Supabase is not initialized or query is empty");
    return;
  }

  // Supabase sorgusu yap
  database
    .from("People")
    .select("*")
    .ilike("Name", `%${query}%`) // İsimde parçalı eşleşme yap
    .then((response) => {
      // Sonuçları işleyin ve ekrana gösterin
      if (response.data.length === 0) {
        database
          .from("People")
          .select("*")
          .ilike("LicenseNumber", `%${query}%`) // İsimde parçalı eşleşme yap
          .then((response) => {
            // Sonuçları işleyin ve ekrana gösterin
            if (response.data.length === 0) {
              displayNoResultsMessageForPeople();
            } else {
              displaySearchResultsForPeople(response.data);
            }
            console.log(response);
          })
          .catch((error) => {
            console.error("Error searching people:", error);
          });
      } else {
        displaySearchResultsForPeople(response.data);
        console.log(response);
      }
    })
    .catch((error) => {
      console.error("Error searching people:", error);
    });
}

function displayNoResultsMessageForPeople() {
  const searchResultsDiv = document.getElementById("searchResults");
  searchResultsDiv.innerHTML =
    "<p>No people found with the provided information.</p>";
}

function displaySearchResultsForPeople(results) {
  const searchResultsDiv = document.getElementById("searchResults");
  searchResultsDiv.innerHTML = "";

  results.forEach((result, index) => {
    const button = document.createElement("button");
    button.style.height = "auto";
    button.style.fontSize = "15px";
    button.textContent = `${result.PersonID} - ${result.Name}`;
    button.classList.add("result-button");
    button.setAttribute("data-index", index);
    button.setAttribute("data-key", "Name"); // Bu satırı ekleyerek data-key attribute'unu ayarlayın
    button.setAttribute("data-info", JSON.stringify(result)); // Objeyi JSON formatında data-info attribute'una ekle
    button.addEventListener("click", showAttributesForPeople);
    searchResultsDiv.appendChild(button);
  });
}

var isClicked = false;

function showAttributesForPeople() {
  const resultInfo = JSON.parse(this.getAttribute("data-info")); // JSON formatında saklanan objeyi al
  const buttonHeight = this.scrollHeight; // Butonun yüksekliğini alın

  // Butonun genişlemesi veya daralması için yüksekliği ayarlayın
  if (isClicked === false) {
    let attributes = '<div style="text-align: left; padding-top: 10px;">'; // Sol kenara hizalama ve üst boşluk
    for (const key in resultInfo) {
      if (resultInfo.hasOwnProperty(key)) {
        attributes += `<div>${key}: ${resultInfo[key]}</div>`;
      }
    }
    attributes += "</div>"; // Div'i kapat
    this.innerHTML = attributes;
    isClicked = true;
  } else {
    this.textContent = `${resultInfo.PersonID} - ${resultInfo.Name}`; // Butonun metnini Name olarak ayarlayın
    this.style.height = "auto";
    isClicked = false;
  }
}

// Araç kaydı numarasına göre araçları arayın
function searchVehicle(vehicleID) {
  if (!database || vehicleID.trim() === "") {
    console.error("Supabase is not initialized or query is empty");
    return;
  }

  database
    .from("Vehicles")
    .select("*")
    .eq("VehicleID", vehicleID) // PlateNumber alanına göre araçları filtrele
    .then((response) => {
      if (response.data.length === 0) {
        displayNoResultsMessage();
      } else {
        displaySearchResultsForVehicle(response.data);
      }
      console.log(response);
    })
    .catch((error) => {
      console.error("Error searching vehicles:", error);
    });
}

function displayNoResultsMessage() {
  const searchResultsDiv = document.getElementById("searchResults");
  searchResultsDiv.innerHTML =
    "<p>No vehicles found with the provided information.</p>";
}

function displaySearchResultsForVehicle(results) {
  const searchResultsDiv = document.getElementById("searchResults");
  searchResultsDiv.innerHTML = "";

  results.forEach((result, index) => {
    const button = document.createElement("button");
    button.style.height = "auto";
    button.style.fontSize = "15px";
    button.textContent = `${result.Make} ${result.Model}`; // Araç markası ve modelini göster
    button.classList.add("result-button");
    button.setAttribute("data-index", index);
    button.setAttribute("data-key", "PlateNumber"); // Bu satırı ekleyerek data-key attribute'unu ayarlayın
    button.setAttribute("data-info", JSON.stringify(result)); // Objeyi JSON formatında data-info attribute'una ekle
    button.addEventListener("click", showAttributesForVehicle);
    searchResultsDiv.appendChild(button);
  });
}

function showAttributesForVehicle() {
  const resultInfo = JSON.parse(this.getAttribute("data-info"));
  const buttonHeight = this.scrollHeight;

  if (!resultInfo) return;

  if (!this.classList.contains("expanded")) {
    let attributes = '<div style="text-align: left; padding-top: 10px;">'; // Sol kenara hizalama ve üst boşluk
    for (const key in resultInfo) {
      if (resultInfo.hasOwnProperty(key)) {
        attributes += `<div>${key}: ${resultInfo[key]}</div>`;
      }
    }
    attributes += "</div>";
    this.innerHTML = attributes;
    this.classList.add("expanded");
  } else {
    this.textContent = `${resultInfo.Make} ${resultInfo.Model}`; // Butonun metnini aracın markası ve modeli olarak ayarlayın
    this.style.height = "auto";
    this.classList.remove("expanded");
  }
}

// Yeni bir araç ekleyin
// Yeni bir araç ekleyin
function addVehicle(vehicleID, make, model, color, ownerId) {
  if (!database || vehicleID.trim() === "") {
    console.error("Supabase is not initialized or query is empty");
    return;
  }
  // Supabase'e ekleme işlemi yap
  database
    .from("Vehicles")
    .insert([
      {
        VehicleID: vehicleID,
        Make: make,
        Model: model,
        Colour: color,
        OwnerID: ownerId,
      },
    ])
    .select()
    .then((response) => {
      if (response.error) {
        const addButton = document.querySelector("body main div button");
        addButton.style.backgroundColor = "red";
        addButton.textContent = "Failed to add vehicle";
        setTimeout(function () {
          // Buraya geciktirilmiş işlemleri yazın
          addButton.textContent = "Add vehicle";
          addButton.style.backgroundColor = "#ff7300";
        }, 2000); // 1000 milisaniye = 1 saniye
      } else {
        console.log("Vehicle added successfully:", response);
        database
          .from("Vehicles")
          .select("*")
          .then((result) => {
            console.log(result);
          });

        // Düğmenin rengini yeşil yap
        const addButton = document.querySelector("body main div button");
        addButton.style.backgroundColor = "green";
        addButton.textContent = "Vehicle added successfully";
        setTimeout(function () {
          // Buraya geciktirilmiş işlemleri yazın
          window.location.reload(); // Sayfa yeniden yüklemeyi buraya ekleyin
        }, 1500); // 1000 milisaniye = 1 saniye
      }
      // İşlem başarılıysa sonucu işleyin
    })
    .catch((error) => {
      // Hata durumunda hatayı gösterin
      console.error("Error adding vehicle:", error);

      // Düğmenin rengini kırmızı yap
    });
}
