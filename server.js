const express = require('express');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-Memory Database
const users = new Map();
const otpStore = new Map();

// Default Demo User
users.set('student@skillbridge.ai', { password: 'password123', name: 'Alex Developer' });

// ================= AUTHENTICATION & OTP ENDPOINTS ================= //

app.post('/api/auth/signup', (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, message: 'All fields required.' });
    if (users.has(email)) return res.status(400).json({ success: false, message: 'User already exists!' });
    users.set(email, { name, password });
    return res.json({ success: true, message: 'Account created! Please sign in.' });
});

app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.get(email);
    if (!user || user.password !== password) return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    const token = 'jwt_' + crypto.randomBytes(16).toString('hex');
    return res.json({ success: true, token, name: user.name, message: 'Login successful!' });
});

app.post('/api/auth/request-otp', (req, res) => {
    const { email } = req.body;
    if (!users.has(email)) return res.status(404).json({ success: false, message: 'No account registered with this email.' });
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(email, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });
    return res.json({ success: true, message: `OTP sent! (Demo OTP: ${otp})`, demoOtp: otp });
});

app.post('/api/auth/reset-password', (req, res) => {
    const { email, otp, newPassword } = req.body;
    const record = otpStore.get(email);
    if (!record || Date.now() > record.expiresAt) return res.status(400).json({ success: false, message: 'OTP expired/invalid.' });
    if (record.otp !== otp) return res.status(400).json({ success: false, message: 'Invalid OTP.' });

    const user = users.get(email);
    user.password = newPassword;
    users.set(email, user);
    otpStore.delete(email);
    return res.json({ success: true, message: 'Password reset successful!' });
});

// ================= ENHANCED AI CHATBOT ================= //

app.post('/api/chat', (req, res) => {
    const { message } = req.body;
    if (!message) return res.status(400).json({ reply: "Please type a message." });

    const query = message.toLowerCase();
    let reply = "";

    if (query.includes("frontend") && query.includes("backend")) {
        reply = "Frontend focuses on UI/UX, DOM manipulation, CSS glassmorphism, and client-side logic (HTML/CSS/JS). Backend manages server logic, REST APIs, authentication, and databases (Express, Node.js).";
    } else if (query.includes("frontend")) {
        reply = "Frontend development involves HTML5, CSS3/Tailwind, JavaScript (ES6+), React/Vue, and API integration to build user interfaces.";
    } else if (query.includes("backend")) {
        reply = "Backend engineering involves API architecture, SQL/NoSQL databases, authentication/security protocols, server routing, and microservices.";
    } else if (query.includes("course") || query.includes("track") || query.includes("module")) {
        reply = "You can click on any Domain Card on the homepage to open the full module syllabus, estimated duration, and key learning outcomes!";
    } else if (query.includes("certificate") || query.includes("cert") || query.includes("degree")) {
        reply = "Click the '🎓 Certificate' button in the navigation bar or complete any course track to generate your official SkillBridge AI Verified Certificate!";
    } else if (query.includes("roadmap") || query.includes("career")) {
        reply = "Our structured learning paths guide you from Core Principles -> System Architecture -> Database Design -> Cloud Deployment.";
    } else if (query.includes("hi") || query.includes("hello") || query.includes("hey")) {
        reply = "Hello! I am your SkillBridge AI Assistant. Ask me about frontend vs backend, course roadmaps, or how to generate your completion certificate!";
    } else {
        reply = `SkillBridge AI Assistant: Regarding "${message}" — our curriculum focuses on production-ready skills, modern full-stack architectures, and automated certification! Select a domain card to start.`;
    }

    return res.json({ reply });
});

// Serve Frontend
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
