import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import OpenAI from 'openai';
import { systemPrompt } from './systemPrompt.js';

const app = express();

app.use(cors());
app.use(express.json());


const OLLAMA_URL = process.env.OLLAMA_URL;

const openai = new OpenAI({
  baseURL: OLLAMA_URL,
  apiKey: 'ollama' 
});

app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;

    const completion = await openai.chat.completions.create({
      model: 'llama3',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ]
    });

    res.json({ reply: completion.choices[0].message.content });
  } catch (error) {
    console.error('Error conectando con Ollama:', error);
    res.status(500).json({ error: 'Hubo un error comunicándose con el modelo de IA local.' });
  }
});

const PORT = process.env.CHATBOT_PORT || 5001;
app.listen(PORT, () => {
  console.log(`Servidor ChatIA escuchando en el puerto ${PORT}`);
  console.log(`Apuntando a Ollama en: ${OLLAMA_URL}`);
});
