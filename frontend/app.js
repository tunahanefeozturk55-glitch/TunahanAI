const chat = document.getElementById("chat");
const form = document.getElementById("chatForm");
const input = document.getElementById("messageInput");
const typing = document.getElementById("typing");

const imageBtn = document.getElementById("imageBtn");
const imageInput = document.getElementById("imageInput");
const clearBtn = document.getElementById("clearBtn");

const characterCount = document.getElementById("characterCount");
const sendBtn = document.getElementById("sendBtn");


// =========================
// BACKEND
// =========================

const API_URL = "https://tunahanai.onrender.com";


// =========================
// AYARLAR
// =========================

const MAX_MESSAGE_LENGTH = 10000;
const STORAGE_KEY = "tunahanai_chat";


// =========================
// SAAT
// =========================

function getCurrentTime() {

  return new Date().toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit"
  });

}


// =========================
// MESAJ EKLE
// =========================

function addMessage(text, type, save = true) {

  const message = document.createElement("div");

  message.className = "message " + type;

  const avatar = document.createElement("div");

  avatar.className = "avatar";

  avatar.textContent = type === "ai" ? "T" : "S";


  const content = document.createElement("div");

  content.className = "message-content";


  const name = document.createElement("div");

  name.className = "message-name";

  name.textContent =
    type === "ai"
      ? "TunahanAI"
      : "Sen";


  const bubble = document.createElement("div");

  bubble.className = "bubble";

  bubble.textContent = text;


  const time = document.createElement("div");

  time.className = "message-time";

  time.textContent = getCurrentTime();


  content.appendChild(name);

  content.appendChild(bubble);

  content.appendChild(time);


  message.appendChild(avatar);

  message.appendChild(content);


  chat.appendChild(message);


  scrollToBottom();


  if (save) {

    saveChat();

  }

}


// =========================
// AŞAĞI KAYDIR
// =========================

function scrollToBottom() {

  requestAnimationFrame(() => {

    chat.scrollTop = chat.scrollHeight;

  });

}


// =========================
// YAZIYOR GÖSTER
// =========================

function showTyping() {

  typing.classList.remove("hidden");

  scrollToBottom();

}


// =========================
// YAZIYOR GİZLE
// =========================

function hideTyping() {

  typing.classList.add("hidden");

}


// =========================
// INPUT TEMİZLE
// =========================

function resetInput() {

  input.value = "";

  updateCharacterCount();

  autoResize();

}


// =========================
// KARAKTER SAYACI
// =========================

function updateCharacterCount() {

  const length = input.value.length;

  characterCount.textContent =
    `${length} / ${MAX_MESSAGE_LENGTH}`;

}


// =========================
// TEXTAREA BÜYÜT
// =========================

function autoResize() {

  input.style.height = "auto";

  const height =
    Math.min(input.scrollHeight, 150);

  input.style.height = height + "px";

}


// =========================
// GÖNDER BUTONU
// =========================

function setSendingState(isSending) {

  sendBtn.disabled = isSending;

  input.disabled = isSending;

  imageBtn.disabled = isSending;


  if (isSending) {

    sendBtn.style.opacity = "0.6";

  } else {

    sendBtn.style.opacity = "1";

    input.disabled = false;

    imageBtn.disabled = false;

  }

}


// =========================
// MESAJ GÖNDER
// =========================

form.addEventListener(
  "submit",
  async function(event) {

    event.preventDefault();


    const message =
      input.value.trim();


    if (!message) {

      return;

    }


    if (message.length > MAX_MESSAGE_LENGTH) {

      addMessage(
        `Mesaj çok uzun. En fazla ${MAX_MESSAGE_LENGTH} karakter kullanabilirsin.`,
        "ai"
      );

      return;

    }


    addMessage(
      message,
      "user"
    );


    resetInput();

    showTyping();

    setSendingState(true);


    try {

      const response =
        await fetch(
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


      let data;

      try {

        data =
          await response.json();

      } catch {

        data = {};

      }


      hideTyping();

      setSendingState(false);


      if (
        response.ok &&
        data.reply
      ) {

        addMessage(
          data.reply,
          "ai"
        );

      } else {

        console.error(
          "Backend cevabı:",
          data
        );


        addMessage(
          "Üzgünüm, şu anda cevap oluşturamadım. Lütfen tekrar dene.",
          "ai"
        );

      }

    } catch (error) {

      console.error(
        "Bağlantı hatası:",
        error
      );


      hideTyping();

      setSendingState(false);


      addMessage(
        "TunahanAI sunucusuna bağlanılamadı. İnternet bağlantını veya backend'i kontrol et.",
        "ai"
      );

    }

  }
);


// =========================
// ENTER
// =========================

input.addEventListener(
  "keydown",
  function(event) {

    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {

      event.preventDefault();

      form.requestSubmit();

    }

  }
);


// =========================
// INPUT DEĞİŞTİ
// =========================

input.addEventListener(
  "input",
  function() {

    updateCharacterCount();

    autoResize();

  }
);


// =========================
// FOTOĞRAF BUTONU
// =========================

imageBtn.addEventListener(
  "click",
  function() {

    imageInput.click();

  }
);


// =========================
// FOTOĞRAF SEÇİLDİ
// =========================

imageInput.addEventListener(
  "change",
  function() {

    if (!imageInput.files.length) {

      return;

    }


    const file =
      imageInput.files[0];


    addMessage(
      "📷 " + file.name + " seçildi.",
      "user"
    );


    // Şimdilik sadece dosya seçimini gösteriyoruz.
    // Gerçek görsel analizi backend'e
    // sonraki aşamada bağlayabiliriz.

    imageInput.value = "";

  }
);


// =========================
// YENİ SOHBET
// =========================

clearBtn.addEventListener(
  "click",
  function() {

    const confirmed =
      confirm(
        "Mevcut sohbet silinsin mi?"
      );


    if (!confirmed) {

      return;

    }


    localStorage.removeItem(
      STORAGE_KEY
    );


    chat.innerHTML = "";


    addMessage(
      "Yeni sohbet başladı! 👋 Sana nasıl yardımcı olabilirim?",
      "ai"
    );

  }
);


// =========================
// SOHBETİ KAYDET
// =========================

function saveChat() {

  const messages =
    [];


  const elements =
    chat.querySelectorAll(
      ".message"
    );


  elements.forEach(
    element => {

      const bubble =
        element.querySelector(
          ".bubble"
        );


      if (!bubble) {

        return;

      }


      messages.push({
        text: bubble.textContent,
        type: element.classList.contains("user")
          ? "user"
          : "ai"
      });

    }
  );


  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(messages)
  );

}


// =========================
// SOHBETİ YÜKLE
// =========================

function loadChat() {

  const saved =
    localStorage.getItem(
      STORAGE_KEY
    );


  if (!saved) {

    return;

  }


  try {

    const messages =
      JSON.parse(saved);


    if (
      !Array.isArray(messages) ||
      messages.length === 0
    ) {

      return;

    }


    chat.innerHTML = "";


    messages.forEach(
      message => {

        addMessage(
          message.text,
          message.type,
          false
        );

      }
    );


  } catch (error) {

    console.error(
      "Sohbet geçmişi yüklenemedi:",
      error
    );

    localStorage.removeItem(
      STORAGE_KEY
    );

  }

}


// =========================
// BAŞLANGIÇ
// =========================

updateCharacterCount();

autoResize();

loadChat();

scrollToBottom();
