const express = require('express');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Google Gen AI client safely
const apiKey = process.env.GEMINI_API_KEY;
let ai = null;

if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
} else {
  console.warn("WARNING: GEMINI_API_KEY environment variable is missing.");
}

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Smart AI Mentor API Route
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Message is required." });
    }

    if (!ai) {
      return res.status(500).json({ 
        reply: "GEMINI_API_KEY is not configured on the server environment." 
      });
    }

    // Generate response using Gemini 2.5 Flash
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: message,
      config: {
        systemInstruction: "You are the Smart AI Mentor on the SkillBridge AI platform. Answer any technical, career, or learning question thoroughly, accurately, and provide formatted code snippets whenever requested."
      }
    });

    const reply = response.text || "No response received from AI.";
    res.json({ reply });

  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ 
      reply: "Error communicating with Gemini AI. Check server logs." 
    });
  }
});

// Single Page Application Fallback Route (Express 4 & 5 Compatible)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
