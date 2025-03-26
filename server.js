const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database connection
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'resume_builder'
};

let db;

async function connectDB() {
    try {
        db = await mysql.createConnection(dbConfig);
        console.log('Connected to MySQL database');
    } catch (err) {
        console.error('Database connection failed:', err);
        process.exit(1);
    }
}

// JWT Secret
const JWT_SECRET = 'your_jwt_secret_key';

// Routes
app.post('/api/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        // Check if user exists
        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create user
        await db.execute(
            'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
            [name, email, hashedPassword]
        );
        
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Check if user exists
        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        
        const user = users[0];
        
        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        
        // Create JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '1h' }
        );
        
        res.json({ 
            token, 
            user: { 
                id: user.id, 
                name: user.name, 
                email: user.email 
            } 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/resume', authenticateToken, async (req, res) => {
    try {
        const [resumes] = await db.execute(
            'SELECT * FROM resumes WHERE user_id = ?',
            [req.user.userId]
        );
        
        if (resumes.length === 0) {
            return res.json({});
        }
        
        const resume = resumes[0];
        res.json({
            personalInfo: JSON.parse(resume.personal_info),
            workExperience: JSON.parse(resume.work_experience),
            education: JSON.parse(resume.education),
            skills: JSON.parse(resume.skills),
            selectedTemplate: resume.template
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/resume', authenticateToken, async (req, res) => {
    try {
        const { personalInfo, workExperience, education, skills, selectedTemplate } = req.body;
        
        // Check if resume exists
        const [resumes] = await db.execute(
            'SELECT * FROM resumes WHERE user_id = ?',
            [req.user.userId]
        );
        
        if (resumes.length > 0) {
            // Update existing resume
            await db.execute(
                `UPDATE resumes SET 
                    personal_info = ?, 
                    work_experience = ?, 
                    education = ?, 
                    skills = ?, 
                    template = ?,
                    updated_at = NOW()
                WHERE user_id = ?`,
                [
                    JSON.stringify(personalInfo),
                    JSON.stringify(workExperience),
                    JSON.stringify(education),
                    JSON.stringify(skills),
                    selectedTemplate,
                    req.user.userId
                ]
            );
        } else {
            // Create new resume
            await db.execute(
                `INSERT INTO resumes 
                    (user_id, personal_info, work_experience, education, skills, template) 
                VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    req.user.userId,
                    JSON.stringify(personalInfo),
                    JSON.stringify(workExperience),
                    JSON.stringify(education),
                    JSON.stringify(skills),
                    selectedTemplate
                ]
            );
        }
        
        res.json({ message: 'Resume saved successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Middleware to authenticate token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }
        req.user = user;
        next();
    });
}

// Start server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});