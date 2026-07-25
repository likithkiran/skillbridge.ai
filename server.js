const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Gemini API Key
const GEMINI_API_KEY = "AQ.Ab8RN6LyNNGiV6-wkAtjSWz5qujwPavFnZn8j_gfNfiBuusQ2w";

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// AI Assistant API Route
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: `You are Smart AI Mentor on the SkillBridge AI platform. Provide clear, accurate technical guidance for: ${message}` }]
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Gemini API Error:", errorData);
      return res.status(500).json({ reply: "Sorry, I encountered an issue connecting to the Gemini AI API." });
    }

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
    
    res.json({ reply });
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ reply: "Internal server error connecting to AI Mentor." });
  }
});

// Fallback route for index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
