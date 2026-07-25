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

// 1. User Signup
app.post('/api/auth/signup', (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }
    if (users.has(email)) {
        return res.status(400).json({ success: false, message: 'User already exists!' });
    }
    users.set(email, { name, password });
    return res.json({ success: true, message: 'Account created successfully! Please sign in.' });
});

// 2. User Login
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.get(email);
    if (!user || user.password !== password) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
    const token = 'jwt_' + crypto.randomBytes(16).toString('hex');
    return res.json({ success: true, token, name: user.name, message: 'Login successful!' });
});

// 3. Request OTP for Forgot Password
app.post('/api/auth/request-otp', (req, res) => {
    const { email } = req.body;
    if (!users.has(email)) {
        return res.status(404).json({ success: false, message: 'No account registered with this email.' });
    }
    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000;
    otpStore.set(email, { otp, expiresAt });

    console.log(`[OTP GENERATED] Email: ${email} | OTP: ${otp}`);

    return res.json({ 
        success: true, 
        message: `OTP sent successfully! (Demo OTP: ${otp})`,
        demoOtp: otp 
    });
});

// 4. Verify OTP and Reset Password
app.post('/api/auth/reset-password', (req, res) => {
    const { email, otp, newPassword } = req.body;
    const record = otpStore.get(email);

    if (!record) {
        return res.status(400).json({ success: false, message: 'OTP not requested or expired.' });
    }
    if (Date.now() > record.expiresAt) {
        otpStore.delete(email);
        return res.status(400).json({ success: false, message: 'OTP expired. Please request a new one.' });
    }
    if (record.otp !== otp) {
        return res.status(400).json({ success: false, message: 'Invalid OTP code.' });
    }

    const user = users.get(email);
    user.password = newPassword;
    users.set(email, user);
    otpStore.delete(email);

    return res.json({ success: true, message: 'Password reset successful! You can now log in with your new password.' });
});

// ================= AI ASSISTANT ENDPOINT ================= //

app.post('/api/chat', (req, res) => {
    const { message } = req.body;
    if (!message) {
        return res.status(400).json({ reply: "Please provide a valid question." });
    }

    const query = message.toLowerCase();
    let reply = "";

    if (query.includes("roadmap") || query.includes("career")) {
        reply = "SkillBridge AI recommends following our 6-module roadmap: Start with Fundamentals, move to Systems Architecture, master Database Optimization, and deploy via Cloud Infrastructure.";
    } else if (query.includes("resume") || query.includes("ats")) {
        reply = "To pass ATS filters, ensure your resume highlights quantifiable project achievements (e.g., 'Deployed Express API handling 10k hits/min') and keyword matches for your targeted stack.";
    } else if (query.includes("certificate") || query.includes("cert")) {
        reply = "You can earn your Master Certificate by completing 100% of your chosen domain track modules and passing the automated assessment!";
    } else if (query.includes("hi") || query.includes("hello") || query.includes("hey")) {
        reply = "Hello! I am your SkillBridge AI Assistant. Ask me anything about career tracks, skill roadmaps, ATS resumes, or tech stacks!";
    } else {
        reply = `I analyzed your query regarding "${message}". To excel in this area, focus on building hands-on projects, optimizing backend architecture, and practicing live deployment on cloud providers like Render!`;
    }

    return res.json({ reply });
});

// Serve Frontend (Regex Catch-All for Express v5)
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
