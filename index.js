const express = require('express');
const app = express();
const path = require('path');
const port = 3000;
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
require('dotenv').config();

app.use(express.json());

const pool = new Pool({
	host: process.env.DB_HOST,
	port: process.env.DB_PORT,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME
});

app.use(session({
	store: new pgSession({ pool }),
	secret: process.env.SESSION_SECRET,
	resave: false,
	saveUninitialized: false,
	cookie: {
		httpOnly: true,
		secure: false,
		maxAge: 1000 * 60 * 60 * 24
	}
}));

function requireAuth(req, res, next) {
	if (!req.session.user) {
		return res.redirect('/login');
	};
	next();
};

app.post('/api/login', async (req, res) => {
	const { username, password } = req.body;
	try {
		const result = await pool.query(
			'SELECT * FROM user_info WHERE username = $1', [username]
		);

		if (result.rows.length === 0) {
			return res.status(404).json({ error: 'Invalid credentials' });
		};

		const user = result.rows[0];
		const match = await bcrypt.compare(password, user.password);

		if (!match) {
			return res.status(401).json({ error: 'invalid credentials' });
		};

		req.session.user = { id: user.id, username: user.username };

		req.session.save((err) => {
			if(err) {
				console.error('Session save error: ', err);
				return response.status(500).json({ error: 'Session error' });
			}
			console.log('Session saved: ', req.session.user);
			return res.json({ success: true, message: 'Login successful' });
		});
	} catch (err) {
		if (!res.headersSent) {
			console.error('Login error: ', err);
			res.status(500).json({ error: 'Server error' });
		}
		console.error('Login error: ', err);
		res.status(500).json({ error: 'Server error' });
	}
});

app.post('/api/register', async (req, res) => {
	const { username, password } = req.body;
	try {
		const existing = await pool.query(
			'SELECT * FROM user_info WHERE username = $1', [username]
		);

		if (existing.rows.length > 0) {
			return res.status(409).json({ error: 'Username already taken' });
		};

		const hash = await bcrypt.hash(password, 10);

		const result = await pool.query(
			'INSERT INTO user_info(username, password) VALUES($1, $2) RETURNING id, username',
			[username, hash]
		);

		res.status(201).json({ message: 'Account created', user: result.rows[0] });
	} catch (err) {
		console.error('Register error: ', err);
		res.status(500).json({ error: 'Server error' });
	}
});

app.use(express.static(path.join(__dirname, 'public')));


app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/register', (req, res) => {
	res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/home', requireAuth,  (req, res) => {
	res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

app.listen(port, () => {
	console.log(`listening on port ${port}`);
});
