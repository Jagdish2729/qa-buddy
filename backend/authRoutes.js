
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();

// ⚠️ MVP: in-memory store (server restart pe clean ho jayega)
const users = []; // { name, email, passwordHash }

// ENV
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

// Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }
    const exists = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) return res.status(409).json({ message: "User already exists" });

    const passwordHash = await bcrypt.hash(password, 10);
    users.push({ name, email, passwordHash });
    return res.json({ success: true });
  } catch (e) {
    return res.status(500).json({ message: "Server error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({ success: true, token });
  } catch (e) {
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
