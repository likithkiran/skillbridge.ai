const express = require('express');
const path = require('path');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3000;

// Gemini API Key
const GEMINI_API_KEY = "AQ.Ab8RN6LyNNGiV6-wkAtjSWz5qujwPavFnZn8j_gfNfiBuusQ2w";

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// AI Assistant API Route
app.post('/api/chat', (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  const payload = JSON.stringify({
    contents: [
      {
        role: "user",
        parts: [{ text: `You are Smart AI Mentor on the SkillBridge AI platform. Provide clear, accurate technical guidance for: ${message}` }]
      }
    ]
  });

  const options = {
    hostname: 'generativelanguage.googleapis.com',
    path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }
  };

  const apiReq = https.request(options, (apiRes) => {
    let data = '';

    apiRes.on('data', (chunk) => {
      data += chunk;
    });

    apiRes.on('end', () => {
      try {
        const parsedData = JSON.parse(data);
        if (apiRes.statusCode >= 200 && apiRes.statusCode < 300) {
          const reply = parsedData.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
          res.json({ reply });
        } else {
          console.error("Gemini API Error:", parsedData);
          res.status(500).json({ reply: "Sorry, I encountered an issue connecting to the Gemini AI API." });
        }
      } catch (e) {
        console.error("JSON Parse Error:", e);
        res.status(500).json({ reply: "Error parsing AI response." });
      }
    });
  });

  apiReq.on('error', (error) => {
    console.error("HTTPS Request Error:", error);
    res.status(500).json({ reply: "Internal server error connecting to AI Mentor." });
  });

  apiReq.write(payload);
  apiReq.end();
});

// Fallback route for Express v5
app.get(/(.*)/, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
