const express = require('express');
const session = require('express-session');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth');
const itemRoutes = require('./routes/items');
 
dotenv.config();
const app = express();
 
// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
 
// Session setup
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
 
// Routes
app.use('/auth', authRoutes);
app.use('/items', itemRoutes);
 
// Home route
app.get('/', (req, res) => {
    res.render('index', { user: req.session.user || null});
});
 
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});