const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcrypt'); // Library for password hashing

const app = express();
const port = 5000; // Server port

// Middleware
app.use(cors());
app.use(bodyParser.json()); // Parse JSON request bodies

// MySQL Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Your MySQL username
    password: '00000', // Your MySQL password
    database: 'WINGS' // Your MySQL database name
});

// Connect to the database
db.connect(err => {
    if (err) {
        console.error('Could not connect to the database:', err.message);
        return;
    }
    console.log('Connected to the database.');
});

// API endpoint to fetch all products
app.get('/products', (req, res) => {
    db.query('SELECT * FROM products', (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error fetching products: ' + err.message });
        }
        res.json(results);
    });
});

// API endpoint to fetch all users
app.get('/users', (req, res) => {
    db.query('SELECT * FROM users', (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error fetching users: ' + err.message });
        }
        res.json(results);
    });
});

// API endpoint to add a product
app.post('/products', (req, res) => {
    const { name, description, price, quantity, category } = req.body;

    if (!name || !description || !price || !quantity || !category) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    const query = 'INSERT INTO products (name, description, price, quantity, category) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [name, description, price, quantity, category], (err) => {
        if (err) {
            return res.status(500).json({ message: 'Error adding product: ' + err.message });
        }
        res.json({ message: 'Product added successfully' });
    });
});

// API endpoint to register a new user
app.post('/users', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    // Hash the password
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            return res.status(500).json({ message: 'Error hashing password: ' + err.message });
        }

        const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
        db.query(query, [username, hashedPassword], (err) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') { // Handle username duplication
                    return res.status(409).json({ message: 'Username already exists' });
                }
                return res.status(500).json({ message: 'Database error during registration: ' + err.message });
            }
            res.json({ message: 'User registered successfully' });
        });
    });
});

// API endpoint to update a product
app.put('/products/:id', (req, res) => {
    const { id } = req.params;
    const { name, description, price, quantity, category } = req.body;

    if (!name || !description || !price || !quantity || !category) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    const query = 'UPDATE products SET name = ?, description = ?, price = ?, quantity = ?, category = ? WHERE id = ?';
    db.query(query, [name, description, price, quantity, category, id], (err) => {
        if (err) {
            return res.status(500).json({ message: 'Error updating product: ' + err.message });
        }
        res.json({ message: 'Product updated successfully' });
    });
});

// API endpoint to delete a product
app.delete('/products/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM products WHERE id = ?';

    db.query(query, [id], (err) => {
        if (err) {
            return res.status(500).json({ message: 'Error deleting product: ' + err.message });
        }
        res.json({ message: 'Product deleted successfully' });
    });
});

// API endpoint to sell a product (update quantity)
app.patch('/products/:id', (req, res) => {
    const { id } = req.params;
    const { quantity } = req.body;

    // Ensure quantity is not negative
    if (quantity < 0) {
        return res.status(400).json({ error: 'Quantity must be a positive integer.' });
    }

    // Update quantity of the specified product
    db.query('UPDATE products SET quantity = ? WHERE id = ?', [quantity, id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error updating product quantity: ' + err.message });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json({ message: 'Product quantity updated successfully' });
    });
});

// API endpoint to delete a user
app.delete('/users/:username', (req, res) => {
    const { username } = req.params;
    const query = 'DELETE FROM users WHERE username = ?';

    db.query(query, [username], (err) => {
        if (err) {
            return res.status(500).json({ message: 'Error deleting user: ' + err.message });
        }
        res.json({ message: 'User deleted successfully' });
    });
});

// API endpoint to update user password
app.put('/users/:username', (req, res) => {
    const { username } = req.params;
    const { password } = req.body;

    if (!password) {
        return res.status(400).json({ message: 'Password is required.' });
    }

    // Hash the new password
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            return res.status(500).json({ message: 'Error hashing password: ' + err.message });
        }

        const query = 'UPDATE users SET password = ? WHERE username = ?';
        db.query(query, [hashedPassword, username], (err) => {
            if (err) {
                return res.status(500).json({ message: 'Error updating user: ' + err.message });
            }
            res.json({ message: 'User updated successfully' });
        });
    });
});

// API endpoint to login a user
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error fetching user: ' + err.message });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const user = results[0];

        // Compare hashed password
        bcrypt.compare(password, user.password, (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Error comparing passwords: ' + err.message });
            }
            if (result) {
                return res.json({ message: 'Login successful' });
            } else {
                return res.status(401).json({ message: 'Invalid credentials.' });
            }
        });
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});