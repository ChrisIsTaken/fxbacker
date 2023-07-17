const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'users',
    password: '2gH10X09postgres',
    port: 5432,
});

const app = express();

app.use(express.json());
app.use(helmet());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes',
});

app.use(limiter);

app.post('/register', [
    check('username').notEmpty().withMessage('Username is required'),
    check('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { username, password } = req.body;

        const existingUser = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.query('INSERT INTO users (username, password) VALUES ($1, $2)', [username, hashedPassword]);

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

        if (user.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        const validPassword = await bcrypt.compare(password, user.rows[0].password);

        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        const token = jwt.sign({ userId: user.rows[0].id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/profile', async (req, res) => {
    try {
        const user = await pool.query('SELECT * FROM users WHERE id = $1', [req.userId]);

        if (user.rows.length === 0) {
            return res.status(400).json({ message: 'User not found' });
        }

        res.json({ fullName: user.rows[0].fullName, bio: user.rows[0].bio });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.put('/profile', async (req, res) => {
    try {
        const { fullName, bio } = req.body;

        const user = await pool.query('SELECT * FROM users WHERE id = $1', [req.userId]);

        if (user.rows.length === 0) {
            return res.status(400).json({ message: 'User not found' });
        }

        await pool.query('UPDATE users SET fullName = $1, bio = $2 WHERE id = $3', [fullName, bio, req.userId]);

        res.json({ message: 'Profile updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/tickdata', async (req, res) => {
    const { symbol, startTime, endTime } = req.query;

    try {
        const result = await pool.query(
            'SELECT * FROM $1 WHERE timestamp BETWEEN $2 AND $3 ORDER BY timestamp',
            [symbol, startTime, endTime]
        );

        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while fetching tick data' });
    }
});

app.listen(4000, () => {
    console.log("Server Has Started 4000");
});