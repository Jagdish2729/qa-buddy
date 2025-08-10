const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { readUsers, writeUsers } = require("./storage");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

// normalize helpers
const normEmail = (e) => (e || "").trim().toLowerCase();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) return res.status(400).json({ message: "All fields required" });

    const users = readUsers();
    const emailN = normEmail(email);
    if (users.find(u => u.email === emailN)) {
      return res.status(409).json({ message: "User already exists" });
    }

    const passwordHash = await bcrypt.hash(password.trim(), 10);
    users.push({ name: name.trim(), email: emailN, passwordHash });
    writeUsers(users);

    return res.json({ success: true });
  } catch (e) {
    console.error("register error:", e);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const users = readUsers();

    const user = users.find(u => u.email === normEmail(email));
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare((password || "").trim(), user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ email: user.email, name: user.name }, JWT_SECRET, { expiresIn: "1d" });
    return res.json({ success: true, token });
  } catch (e) {
    console.error("login error:", e);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
