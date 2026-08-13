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
// SESLİ KONUŞMA ELEMENTLERİ
// =========================

const micBtn = document.getElementById("micBtn");

const voiceOverlay =
  document.getElementById("voiceOverlay");

const closeVoiceBtn =
  document.getElementById("closeVoiceBtn");

const voiceMicBtn =
  document.getElementById("voiceMicBtn");

const voiceStatus =
  document.getElementById("voiceStatus");

const voiceTranscript =
  document.getElementById("voiceTranscript");


// =========================
// BACKEND
// =========================

const API_URL =
  "https://tunahanai.onrender.com";


// =========================
// AYARLAR
// =========================

const MAX_MESSAGE_LENGTH = 10000;

const STORAGE_KEY =
  "tunahanai_chat";


// =========================
// SESLİ KONUŞMA
// =========================

let recognition = null;

let isListening = false;

let speechSupported =
  "speechSynthesis" in window &&
  (
    "SpeechRecognition" in window ||
    "webkitSpeechRecognition" in window
  );


// =========================
// SPEECH RECOGNITION
// =========================

if (
  "SpeechRecognition" in window ||
  "webkitSpeechRecognition" in window
) {

  const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

  recognition =
    new SpeechRecognition();

  recognition.lang = "tr-TR";

  recognition.continuous = false;

  recognition.interimResults = true;

  recognition.maxAlternatives = 1;


  recognition.onstart = function() {

    isListening = true;

    updateVoiceUI(true);

  };


  recognition.onresult =
    function(event) {

      let finalText = "";

      let interimText = "";


      for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
      ) {

        const transcript =
          event.results[i][0].transcript;


        if (
          event.results[i].isFinal
        ) {

          finalText += transcript;

        } else {

          interimText += transcript;

        }

      }


      const visibleText =
        finalText || interimText;


      if (visibleText) {

        voiceTranscript.textContent =
          visibleText;

      }


      if (finalText.trim()) {

        input.value =
          finalText.trim();

        updateCharacterCount();

        autoResize();

        stopListening();

        closeVoiceMode();

        setTimeout(() => {

          sendVoiceMessage(
            finalText.trim()
          );

        }, 250);

      }

    };


  recognition.onerror =
    function(event) {

      console.error(
        "Mikrofon hatası:",
        event.error
      );


      isListening = false;

      updateVoiceUI(false);


      if (
        event.error === "not-allowed"
      ) {

        voiceStatus.textContent =
          "Mikrofon izni verilmedi";

        voiceTranscript.textContent =
          "Tarayıcı ayarlarından mikrofon iznini aç.";

      } else if (
        event.error === "no-speech"
      ) {

        voiceStatus.textContent =
          "Ses algılanamadı";

        voiceTranscript.textContent =
          "Tekrar konuşmayı deneyebilirsin.";

      } else {

        voiceStatus.textContent =
          "Mikrofon kullanılamıyor";

        voiceTranscript.textContent =
          "Lütfen tekrar dene.";

      }

    };


  recognition.onend =
    function() {

      isListening = false;

      updateVoiceUI(false);

    };

}


// =========================
// SESLİ UI
// =========================

function updateVoiceUI(active) {

  if (!voiceOverlay) {
    return;
  }


  if (active) {

    voiceOverlay.classList.remove(
      "hidden"
    );

    voiceMicBtn.classList.add(
      "active"
    );

    micBtn.classList.add(
      "active"
    );

    voiceStatus.textContent =
      "Dinliyorum...";

  } else {

    voiceMicBtn.classList.remove(
      "active"
    );

    micBtn.classList.remove(
      "active"
    );

  }

}


// =========================
// SESLİ MODU AÇ
// =========================

function openVoiceMode() {

  if (!recognition) {

    alert(
      "Bu tarayıcı sesli konuşmayı desteklemiyor. Chrome veya Edge kullanmayı deneyebilirsin."
    );

    return;

  }


  voiceOverlay.classList.remove(
    "hidden"
  );


  voiceStatus.textContent =
    "Dinliyorum...";

  voiceTranscript.textContent =
    "Konuşmaya başlayabilirsin";


  startListening();

}


// =========================
// DİNLEMEYİ BAŞLAT
// =========================

function startListening() {

  if (!recognition) {
    return;
  }


  if (isListening) {
    return;
  }


  try {

    recognition.start();

  } catch (error) {

    console.warn(
      "Mikrofon zaten aktif olabilir:",
      error
    );

  }

}


// =========================
// DİNLEMEYİ DURDUR
// =========================

function stopListening() {

  if (!recognition) {
    return;
  }


  try {

    recognition.stop();

  } catch (error) {

    console.warn(
      "Mikrofon durdurulamadı:",
      error
    );

  }


  isListening = false;

  updateVoiceUI(false);

}


// =========================
// SESLİ MODU KAPAT
// =========================

function closeVoiceMode() {

  stopListening();


  if (voiceOverlay) {

    voiceOverlay.classList.add(
      "hidden"
    );

  }

}


// =========================
// MİKROFON BUTONU
// =========================

if (micBtn) {

  micBtn.addEventListener(
    "click",
    function() {

      openVoiceMode();

    }
  );

}


// =========================
// SESLİ EKRAN MİKROFON
// =========================

if (voiceMicBtn) {

  voiceMicBtn.addEventListener(
    "click",
    function() {

      if (isListening) {

        stopListening();

        voiceStatus.textContent =
          "Mikrofon kapatıldı";

      } else {

        startListening();

      }

    }
  );

}


// =========================
// SESLİ EKRAN KAPAT
// =========================

if (closeVoiceBtn) {

  closeVoiceBtn.addEventListener(
    "click",
    function() {

      closeVoiceMode();

    }
  );

}


// =========================
// ESC İLE KAPAT
// =========================

document.addEventListener(
  "keydown",
  function(event) {

    if (
      event.key === "Escape" &&
      !voiceOverlay.classList.contains(
        "hidden"
      )
    ) {

      closeVoiceMode();

    }

  }
);


// =========================
// AI CEVABINI SESLİ OKU
// =========================

function speakText(text) {

  if (
    !("speechSynthesis" in window)
  ) {

    return;

  }


  window.speechSynthesis.cancel();


  const utterance =
    new SpeechSynthesisUtterance(
      text
    );


  utterance.lang = "tr-TR";

  utterance.rate = 1;

  utterance.pitch = 1;

  utterance.volume = 1;


  utterance.onstart =
    function() {

      if (
        !voiceOverlay.classList.contains(
          "hidden"
        )
      ) {

        voiceStatus.textContent =
          "TunahanAI konuşuyor...";

      }

    };


  utterance.onend =
    function() {

      if (
        !voiceOverlay.classList.contains(
          "hidden"
        )
      ) {

        voiceStatus.textContent =
          "Dinliyorum...";

      }

    };


  window.speechSynthesis.speak(
    utterance
  );

}


// =========================
// SAAT
// =========================

function getCurrentTime() {

  return new Date().toLocaleTimeString(
    "tr-TR",
    {
      hour: "2-digit",
      minute: "2-digit"
    }
  );

}


// =========================
// MESAJ EKLE
// =========================

function addMessage(
  text,
  type,
  save = true
) {

  const message =
    document.createElement("div");

  message.className =
    "message " + type;


  const avatar =
    document.createElement("div");

  avatar.className =
    "avatar";

  avatar.textContent =
    type === "ai"
      ? "T"
      : "S";


  const content =
    document.createElement("div");

  content.className =
    "message-content";


  const name =
    document.createElement("div");

  name.className =
    "message-name";

  name.textContent =
    type === "ai"
      ? "TunahanAI"
      : "Sen";


  const bubble =
    document.createElement("div");

  bubble.className =
    "bubble";

  bubble.textContent =
    text;


  const time =
    document.createElement("div");

  time.className =
    "message-time";

  time.textContent =
    getCurrentTime();


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

  requestAnimationFrame(
    () => {

      chat.scrollTop =
        chat.scrollHeight;

    }
  );

}


// =========================
// YAZIYOR GÖSTER
// =========================

function showTyping() {

  typing.classList.remove(
    "hidden"
  );

  scrollToBottom();

}


// =========================
// YAZIYOR GİZLE
// =========================

function hideTyping() {

  typing.classList.add(
    "hidden"
  );

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

  const length =
    input.value.length;


  characterCount.textContent =
    `${length} / ${MAX_MESSAGE_LENGTH}`;

}


// =========================
// TEXTAREA BÜYÜT
// =========================

function autoResize() {

  input.style.height =
    "auto";


  const height =
    Math.min(
      input.scrollHeight,
      150
    );


  input.style.height =
    height + "px";

}


// =========================
// GÖNDERME DURUMU
// =========================

function setSendingState(
  isSending
) {

  sendBtn.disabled =
    isSending;

  input.disabled =
    isSending;

  imageBtn.disabled =
    isSending;

  micBtn.disabled =
    isSending;


  sendBtn.style.opacity =
    isSending
      ? "0.6"
      : "1";

}


// =========================
// NORMAL MESAJ GÖNDER
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


    if (
      message.length >
      MAX_MESSAGE_LENGTH
    ) {

      addMessage(
        `Mesaj çok uzun. En fazla ${MAX_MESSAGE_LENGTH} karakter kullanabilirsin.`,
        "ai"
      );

      return;

    }


    await sendMessage(
      message,
      false
    );

  }
);


// =========================
// ORTAK MESAJ GÖNDERME
// =========================

async function sendMessage(
  message,
  fromVoice = false
) {

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
            "Content-Type":
              "application/json"
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


      // Sesli moddan geldiyse
      // cevabı sesli oku.

      if (fromVoice) {

        speakText(
          data.reply
        );

      }

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


// =========================
// SESLİ MESAJ GÖNDER
// =========================

async function sendVoiceMessage(
  message
) {

  if (!message) {
    return;
  }


  // Sesli ekrandan gelen mesaj
  // doğrudan backend'e gönderilir.

  await sendMessage(
    message,
    true
  );

}


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
// FOTOĞRAF
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

    if (
      !imageInput.files.length
    ) {

      return;

    }


    const file =
      imageInput.files[0];


    addMessage(
      "📷 " +
      file.name +
      " seçildi.",
      "user"
    );


    imageInput.value =
      "";

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


    chat.innerHTML =
      "";


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

        text:
          bubble.textContent,

        type:
          element.classList.contains(
            "user"
          )
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


    chat.innerHTML =
      "";


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
