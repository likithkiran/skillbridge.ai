const express = require('express');
const path = require('path');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Gemini AI Chat Route
app.post('/api/chat', (req, res) => {
  const { message } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!message) {
    return res.status(400).json({ error: "Message is required." });
  }

  if (!apiKey) {
    return res.status(500).json({ reply: "API key is missing on the server environment." });
  }

  const payload = JSON.stringify({
    contents: [
      {
        parts: [{ text: `You are Smart AI Mentor on SkillBridge AI platform. Answer clearly and helpfully: ${message}` }]
      }
    ]
  });

  const options = {
    hostname: 'generativelanguage.googleapis.com',
    path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }
  };

  const apiReq = https.request(options, (apiRes) => {
    let data = '';
    apiRes.on('data', chunk => data += chunk);
    apiRes.on('end', () => {
      try {
        const parsed = JSON.parse(data);
        const reply = parsed.candidates?.[0]?.content?.parts?.[0]?.text || "No reply generated.";
        res.json({ reply });
      } catch (e) {
        res.status(500).json({ reply: "Error parsing AI response." });
      }
    });
  });

  apiReq.on('error', () => {
    res.status(500).json({ reply: "Error connecting to AI service." });
  });

  apiReq.write(payload);
  apiReq.end();
});

// Wildcard catch-all for single page application
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
