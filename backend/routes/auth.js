const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../database");
const signToken = require("../middleware/auth");

const { userAlreadyExists } = require("../utils/user");

router.post("/register", async (req, res, next) => {

    if (!req.body)
        return res.status(400).json({ message: "Request body is missing" });

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res
            .status(400)
            .json({ message: "Name, email, and password are required" });
    }

    if (password.length < 6) {
        return res
            .status(400)
            .json({ message: "Password must be at least 6 characters long" });
    }

    const isUserExists = await userAlreadyExists(email);

    if (isUserExists.length > 0) {
        return res.status(400).json({ message: "User with this email already exists" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 12);

        const conn = await db.getConnection();
        const result = await conn.query(
            "INSERT INTO users (name, email, password) VALUES (?, ?, ?)", 
            [name, email, hashedPassword]
        );
        conn.release();

        const payload = { id: Number(result.insertId), name, email };
        const token = signToken.signToken(payload);

        res.json({ message: "User registered successfully", token });
    } catch (err) {
        console.error("Error registering user:", err.message);
        res.status(500).json({ message: "Error registering user" });
    }
});

router.post("/login", async (req, res) => {
    if (!req.body)
        return res.status(400).json({ message: "Request body is missing" });

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    try {
        const user = await userAlreadyExists(email);

        if (user.length === 0) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const isPasswordValid = await bcrypt.compare(password, user[0].password);

        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const payload = { id: user[0].id, name: user[0].name, email: user[0].email };
        const token = signToken.signToken(payload);
        res.json({ message: "Login successful", token });
    } catch (err) {
        console.error("Error during login:", err.message);
        res.status(500).json({ message: "Error during login" });
    }
});

module.exports = router;
