const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = 'skillbridge_secure_jwt_secret_key_2026';

// Middleware
app.use(cors());
app.use(express.json());

// Enterprise Career Tracks & Skill Matching Database
const CAREER_TRACKS = [
  {
    id: 'fullstack',
    title: 'Full-Stack Web Engineer',
    skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'Express', 'MongoDB', 'REST API'],
    description: 'Build complete web applications from modern frontends to robust server APIs.'
  },
  {
    id: 'backend',
    title: 'Backend Systems Architect',
    skills: ['Node.js', 'Express', 'Python', 'PostgreSQL', 'Docker', 'Redis', 'Microservices'],
    description: 'Design scalable server-side systems, databases, and secure APIs.'
  },
  {
    id: 'ai',
    title: 'AI & Machine Learning Specialist',
    skills: ['Python', 'PyTorch', 'TensorFlow', 'LLMs', 'Prompt Engineering', 'LangChain'],
    description: 'Develop and deploy intelligent AI systems and large language model applications.'
  },
  {
    id: 'cloud',
    title: 'Cloud & DevOps Engineer',
    skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Linux', 'Terraform', 'Security'],
    description: 'Manage enterprise cloud infrastructure, deployments, and automated pipelines.'
  }
];

// --- ROUTES ---

// 1. Health Check Route
app.get('/', (req, res) => {
  res.send(`
    <div style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
      <h2>⚡ SkillBridge AI Backend Engine Running!</h2>
      <p>Server is successfully active on <strong>Port ${PORT}</strong>.</p>
    </div>
  `);
});

// 2. Authentication Route (JWT Generation)
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  // Generate JWT token
  const token = jwt.sign({ username, role: 'student' }, JWT_SECRET, { expiresIn: '2h' });

  return res.json({
    message: 'Authentication successful!',
    token,
    user: { username, role: 'student' }
  });
});

// 3. Career Track Skill Matching Route
app.post('/api/tracks/match', (req, res) => {
  const { userSkills = [] } = req.body;

  const results = CAREER_TRACKS.map(track => {
    const matched = track.skills.filter(s =>
      userSkills.some(us => us.toLowerCase() === s.toLowerCase())
    );
    const matchPercentage = Math.round((matched.length / track.skills.length) * 100);

    return {
      ...track,
      matchPercentage,
      matchedSkills: matched
    };
  }).sort((a, b) => b.matchPercentage - a.matchPercentage);

  res.json({ tracks: results });
});

// 4. Resume ATS Parsing Route
app.post('/api/ats/parse', (req, res) => {
  const { resumeText } = req.body;

  if (!resumeText) {
    return res.status(400).json({ error: 'Please provide resume text for parsing.' });
  }

  // Simulated ATS Keyword Extraction
  const knownKeywords = ['JavaScript', 'Node.js', 'Express', 'React', 'Python', 'SQL', 'Git', 'HTML', 'CSS', 'AWS', 'Docker'];
  const extractedSkills = knownKeywords.filter(keyword =>
    resumeText.toLowerCase().includes(keyword.toLowerCase())
  );

  const atsScore = Math.min(100, Math.max(35, extractedSkills.length * 15));

  res.json({
    atsScore,
    extractedSkills,
    feedback: atsScore >= 70 
      ? 'Strong alignment with software development roles!' 
      : 'Consider adding more core technical competencies and framework keywords.'
  });
});

// 5. AI Technical Mentor Endpoint
app.post('/api/mentor/chat', (req, res) => {
  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ error: 'Question is required.' });
  }

  // Intelligent Mentor Responses based on Query Keywords
  let response = "That's a great question! Keep practicing building projects and understanding underlying fundamentals.";

  const q = question.toLowerCase();
  if (q.includes('node') || q.includes('express')) {
    response = "Node.js runs JavaScript on the server. Express simplifies routing and middleware handling to build REST APIs efficiently.";
  } else if (q.includes('jwt') || q.includes('auth')) {
    response = "JWT (JSON Web Tokens) provide stateless authentication. The client stores the token and attaches it to request headers for authorization.";
  } else if (q.includes('cors')) {
    response = "CORS (Cross-Origin Resource Sharing) is a security mechanism that allows your backend to securely accept requests from frontend domains.";
  }

  res.json({
    reply: response,
    mentor: "SkillBridge AI Assistant"
  });
});

// 6. Server-Verified Certificate Unlocking Endpoint
app.post('/api/certificate/unlock', (req, res) => {
  const { trackId, userSkills = [] } = req.body;

  const track = CAREER_TRACKS.find(t => t.id === trackId);
  if (!track) {
    return res.status(404).json({ error: 'Career track not found.' });
  }

  const matched = track.skills.filter(s =>
    userSkills.some(us => us.toLowerCase() === s.toLowerCase())
  );
  const completionRate = (matched.length / track.skills.length) * 100;

  if (completionRate >= 75) {
    const certificateId = `SKILLBRIDGE-CERT-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    return res.json({
      unlocked: true,
      certificateId,
      trackTitle: track.title,
      issueDate: new Date().toISOString().split('T')[0],
      message: 'Congratulations! You have verified server requirements and unlocked your certificate.'
    });
  } else {
    return res.status(403).json({
      unlocked: false,
      message: `Certificate locked. You need at least 75% skill mastery for ${track.title}. Current: ${Math.round(completionRate)}%`
    });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`⚡ SkillBridge AI Backend Engine running on Port ${PORT}`);
  console.log(`🔗 Local Access: http://localhost:${PORT}`);
  console.log(`==================================================\n`);
});