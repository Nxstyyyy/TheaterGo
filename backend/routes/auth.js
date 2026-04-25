const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

router.post("/register", async (req, res, next) => {

    if (!req.body)
        return res.status(400).json({ message: "Request body is missing" });

    const { name, username, password } = req.body;
    if (!name || !username || !password) {
        return res
            .status(400)
            .json({ message: "Name, username, and password are required" });
    }

    try {
        const hashed = await bcrypt.hash(password, 10);
        res.json({ message: "User registered successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error registering user" });
    }
});

module.exports = router;
