const express = require("express");
const OpenAI = require("openai");
const path = require("path");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 3000;

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.use(express.json());

app.use(
  express.static(
    path.join(__dirname, "../frontend")
  )
);

app.post("/api/chat", async (req, res) => {

  try {

    const userMessage = req.body.message;

    if (!userMessage) {

      return res.status(400).json({
        error: "Mesaj boş olamaz."
      });

    }

    const response = await client.responses.create({

      model: "gpt-5",

      instructions: `
Sen TunahanAI'sin.

Türkçe konuş.
Samimi, yardımsever ve anlaşılır ol.
Öğrencilerle konuşurken seviyelerine uygun anlat.
Matematik sorularında işlemleri adım adım göster.
Bilmediğin bilgileri uydurma.
      `,

      input: userMessage

    });

    res.json({
      reply: response.output_text
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Yapay zeka bağlantısında hata oluştu."
    });

  }

});

app.listen(PORT, () => {

  console.log(
    `TunahanAI çalışıyor: ${PORT}`
  );

});
