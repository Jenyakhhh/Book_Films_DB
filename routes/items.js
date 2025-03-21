const express = require('express');
const db = require("../config/db");
const router = express.Router();

const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        return next();
    }
    res.redirect('/auth/login');
};

router.get('/dashboard', isAuthenticated, (req, res) => {
    db.query('SELECT * FROM items', (err, items) => {
        if (err) {
            return res.status(500).send("Error fetching items");
        }
        res.render('dashboard', { user: req.session.user, items });
    });
});



// Add item
router.post('/add', isAuthenticated, (req, res) => {
    const { title, type, picture_url } = req.body;
    if (!title || !type || !picture_url) {  
        return res.status(400).send('All fields are required');
    }
    db.query(
        'INSERT INTO items (title, type, picture_url, user_id) VALUES (?, ?, ?, ?)',
        [title, type, picture_url, req.session.user.id],
        (err) => {
            if (err) {
                return res.status(500).send('Error adding item');
            }
            res.redirect('/items/dashboard');  
        }
    );
});

router.get("/view/:id", (req, res) => {
    const itemId = req.params.id
    db.query("select * from items where id = ?", [itemId], (err, items) => {
        console.log(items)
        if(err||items.length === 0){
            return res.status(500).send("Item not found")
        }
        db.query("select r.*, u.name FROM reviews r join users u on r.user_id = u.id where item_id = ?", [itemId], (err, reviews) => {
            if(err){
                return res.status(500).send("error fetching reviews")
            }
            res.render("item", {item: items[0], reviews, user:req.session.user || null})
        })
    })
  });


// Add review
router.post('/reviews/:id', isAuthenticated, (req, res) => {
    const { rating, comment } = req.body;
    const itemId = req.params.id;
    if (!rating || !comment) { 
        return res.status(400).send('Rating and comment are required');
    }
    db.query(
        'INSERT INTO reviews (item_id, user_id, rating, comment) VALUES (?, ?, ?, ?)',
        [itemId, req.session.user.id, rating, comment],
        (err) => {
            if (err) {
                return res.status(500).send('Error adding review');
            }
            res.redirect(`/items/view/${itemId}`);
        }
    );
});

router.post('/delete/:id', isAuthenticated, (req, res) => {
    const itemId = req.params.id;
    db.query('DELETE FROM items WHERE id = ? AND user_id = ?', [itemId, req.session.user.id], (err) => {
        if (err) {
            return res.status(500).send('Error deleting item');
        }
        res.redirect('/items/dashboard');
    });
});

module.exports = router;
