require("dotenv").config();

const express = require("express");
const path = require("path");
const { GoogleGenAI } = require("@google/genai");

const app = express();


// =========================
// EXPRESS AYARLARI
// =========================

app.use(express.json({ limit: "10mb" }));

app.use(
  express.static(
    path.join(__dirname, "../frontend")
  )
);


// =========================
// GOOGLE AI
// =========================

if (!process.env.GEMINI_API_KEY) {
  console.error(
    "HATA: GEMINI_API_KEY bulunamadı!"
  );
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,

  httpOptions: {
    apiVersion: "v1"
  }
});


// =========================
// SAĞLIK KONTROLÜ
// =========================

app.get("/api/health", (req, res) => {

  res.json({
    status: "ok",
    service: "TunahanAI",
    ai: "Gemini",
    time: new Date().toISOString()
  });

});


// =========================
// CHAT
// =========================

app.post("/api/chat", async (req, res) => {

  try {

    const message =
      typeof req.body.message === "string"
        ? req.body.message.trim()
        : "";


    // Mesaj kontrolü
    if (!message) {

      return res.status(400).json({
        error: "Mesaj gönderilmedi."
      });

    }


    // Çok uzun mesaj kontrolü
    if (message.length > 10000) {

      return res.status(400).json({
        error:
          "Mesaj çok uzun. En fazla 10000 karakter kullanabilirsin."
      });

    }


    console.log(
      "Yeni mesaj:",
      message.substring(0, 100)
    );


    // =========================
    // GEMINI INTERACTION
    // =========================

    const interaction =
      await ai.interactions.create({

        model: "gemini-3.6-flash",

        input: message,

        system_instruction:
          "Sen TunahanAI adlı yardımcı bir yapay zeka asistanısın. Türkçe konuş. Kullanıcıya açık, doğru, doğal ve yardımcı cevaplar ver. Gerektiğinde kod örnekleri kullan. Bilmediğin bir şeyi kesinmiş gibi söyleme."

      });


    const reply =
      interaction.output_text;


    // Cevap kontrolü
    if (!reply) {

      console.error(
        "Gemini boş cevap döndürdü:",
        interaction
      );

      return res.status(500).json({
        error:
          "Yapay zekadan boş cevap geldi."
      });

    }


    console.log(
      "TunahanAI cevap verdi."
    );


    res.json({
      reply: reply,
      interactionId: interaction.id || null
    });


  } catch (error) {

    console.error(
      "Gemini API Hatası:",
      error
    );


    let errorMessage =
      "TunahanAI şu anda cevap veremiyor.";


    if (
      error &&
      error.message
    ) {

      errorMessage =
        error.message;

    }


    res.status(500).json({
      error: errorMessage
    });

  }

});


// =========================
// FRONTEND
// =========================

app.get("*", (req, res) => {

  res.sendFile(
    path.join(
      __dirname,
      "../frontend/index.html"
    )
  );

});


// =========================
// PORT
// =========================

const PORT =
  process.env.PORT || 3000;


app.listen(
  PORT,
  () => {

    console.log(
      `TunahanAI sunucusu ${PORT} portunda çalışıyor.`
    );

  }
);
