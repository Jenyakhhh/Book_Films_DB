const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const router = express.Router();
 
// Register
router.get('/register', (req, res) => {
    res.render('register');
});
 
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    db.query(
        'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
        [name, email, hashedPassword],
        (err) => {
            if (err) {
                return res.status(500).send('Error registering user');
            }
            res.redirect('/auth/login');
        }
    );
});
 
// Login
router.get('/login', (req, res) => {
    res.render('login');
});
 
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
        if (err || results.length === 0) {
            return res.status(400).send('User not found');
        }
        const user = results[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(400).send('Invalid password');
        }
        req.session.user = user;
        res.redirect('/items/dashboard');
    });
});
 
// Logout
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});
 
module.exports = router;