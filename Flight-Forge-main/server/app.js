// app.js

require("dotenv").config();
const cors = require('cors');
const morgan = require("morgan");
const express = require("express");
const port = process.env.PORT || 3000;
const db = require("./db");
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const authenticateToken = require('./authenticateToken');

function sha256(inputString) {
  const hash = crypto.createHash('sha256');
  hash.update(inputString, 'utf-8');
  return hash.digest('hex');
}

const app = express();

app.use(cors());
app.use(express.json());

// Routes requiring authentication
app.use('/api/v1/user', authenticateToken);

// Signup
app.post("/api/v1/user/signup", async (req, res) => {
    try {
        console.log(req.body);
        const { first_name, last_name, dateofbirth, mobileno, password, city, country, zipcode } = req.body;

        // Assuming you have the sha256 function available for hashing the password
        const hashedPassword = sha256(password);

        const results = await db.query(
            `INSERT INTO APP_USER (first_name, last_name, dateofbirth, mobileno, password, city, country, zipcode, age)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CalculateAge($3))
            RETURNING *`,
            [first_name, last_name, dateofbirth, mobileno, hashedPassword, city, country, zipcode]
        );

        console.log(results.rows);

        if (results.rows.length != 0) {
            res.status(200).json({
                status: "success",
                results: results.rows.length,
                data: {
                    flightforge: results.rows,
                }
            });
        } else {
            res.status(201).json({
                status: "failed",
                data: {
                    flightforge: "wrong data format",
                }
            });
        }
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Login
app.post("/api/v1/user/login", async (req, res) => {
    try {
        console.log(req.body);
        const { user_id, password } = req.body;

        const results = await db.query("SELECT * FROM APP_USER WHERE id = $1", [user_id]);
        console.log(results.rows);

        if (results.rows.length === 0) {
            res.status(401).json({
                status: "failed",
                data: {
                    message: "User not found",
                }
            });
            return;
        }

        const user = results.rows[0];

        if (user.password !== sha256(password)) {
            res.status(401).json({
                status: "failed",
                data: {
                    message: "Incorrect password",
                }
            });
            return;
        }

        // Generate JWT token
        const accessToken = jwt.sign({ user_id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({
            status: "success",
            data: {
                accessToken: accessToken,
            }
        });

    } catch (err) {
        console.error('Error logging in:', err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Protected route example
app.get("/api/v1/user/profile", async (req, res) => {
    try {
        const user_id = req.user.user_id;

        // Fetch user data based on user_id
        const userData = await db.query("SELECT * FROM APP_USER WHERE id = $1", [user_id]);

        res.status(200).json({
            status: "success",
            data: {
                user: userData.rows[0],
            }
        });
    } catch (err) {
        console.error('Error fetching user profile:', err);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.listen(port, () => {
    console.log(`Server is up, on port ${port}`);
});
