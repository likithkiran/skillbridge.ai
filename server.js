const express = require('express');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Google Gen AI client with API key from environment variables
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

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

    // Call Gemini 2.5 Flash model
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
      reply: "Sorry, I ran into an issue processing your request. Please ensure your GEMINI_API_KEY environment variable is set correctly." 
    });
  }
});

// Express v5 Compatible Wildcard Route
app.get(/(.*)/, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
