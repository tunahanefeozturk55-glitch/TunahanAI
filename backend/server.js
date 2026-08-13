require('dotenv').config();

const express = require('express');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
        apiVersion: "v1"
    }
});

app.post('/api/chat', async (req, res) => {
    try {
        const message = req.body.message;

        if (!message) {
            return res.status(400).json({
                error: 'Mesaj gönderilmedi.'
            });
        }

        const interaction = await ai.interactions.create({
            model: 'gemini-3.6-flash',
            input: message
        });

        const reply = interaction.output_text;

        res.json({ reply });

    } catch (error) {
        console.error('Hata:', error);

        res.status(500).json({
            error: error.message || 'Bir hata oluştu.'
        });
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda çalışıyor.`);
});
