const chat = document.getElementById("chat");
const form = document.getElementById("chatForm");
const input = document.getElementById("messageInput");
const typing = document.getElementById("typing");

const imageBtn = document.getElementById("imageBtn");
const imageInput = document.getElementById("imageInput");
const clearBtn = document.getElementById("clearBtn");


// TunahanAI'nin backend adresi
const API_URL = "https://tunahanai.onrender.com";


// MESAJ EKLE
function addMessage(text, type) {

  const message = document.createElement("div");
  message.className = "message " + type;

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = type === "ai" ? "T" : "S";

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = text;

  message.appendChild(avatar);
  message.appendChild(bubble);

  chat.appendChild(message);

  chat.scrollTop = chat.scrollHeight;
}


// MESAJ GÖNDER
form.addEventListener("submit", async function(event) {

  event.preventDefault();

  const message = input.value.trim();

  if (!message) return;

  addMessage(message, "user");

  input.value = "";

  typing.classList.remove("hidden");

  try {

    const response = await fetch(
      API_URL + "/api/chat",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          message: message
        })
      }
    );

    const data = await response.json();

    typing.classList.add("hidden");

    if (response.ok && data.reply) {

      addMessage(data.reply, "ai");

    } else {

      addMessage(
        "TunahanAI cevap veremedi. Backend veya API bağlantısını kontrol etmemiz gerekiyor.",
        "ai"
      );

      console.error("Backend cevabı:", data);

    }

  } catch (error) {

    typing.classList.add("hidden");

    addMessage(
      "TunahanAI sunucusuna bağlanılamadı.",
      "ai"
    );

    console.error("Bağlantı hatası:", error);

  }

});


// FOTOĞRAF BUTONU
imageBtn.addEventListener("click", function() {

  imageInput.click();

});


// FOTOĞRAF SEÇİLDİ
imageInput.addEventListener("change", function() {

  if (!imageInput.files.length) return;

  const file = imageInput.files[0];

  addMessage(
    "📷 " + file.name + " seçildi.",
    "user"
  );

});


// YENİ SOHBET
clearBtn.addEventListener("click", function() {

  chat.innerHTML = "";

  addMessage(
    "Yeni sohbet başladı! 👋 Sana nasıl yardımcı olabilirim?",
    "ai"
  );

});


// ENTER İLE GÖNDER
input.addEventListener("keydown", function(event) {

  if (event.key === "Enter" && !event.shiftKey) {

    event.preventDefault();

    form.requestSubmit();

  }

});
