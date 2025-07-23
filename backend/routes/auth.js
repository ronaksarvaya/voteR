const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

module.exports = (db) => {
  const router = express.Router();

  // Setup nodemailer transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Signup
  router.post("/signup", async (req, res) => {
    let { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    email = email.trim().toLowerCase();
    console.log("Signup attempt:", email);
    try {
      const existing = await db.collection("users").findOne({ email });
      if (existing) {
        return res.status(409).json({ error: "Email already registered" });
      }
      const passwordHash = await bcrypt.hash(password, 10);
      const otp = generateOTP();
      const user = {
        email,
        passwordHash,
        verified: false,
        otp,
        otpCreatedAt: new Date(),
        createdAt: new Date(),
      };
      await db.collection("users").insertOne(user);
      // Send OTP email
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Your VoteR Verification OTP",
        text: `Your OTP for VoteR signup is: ${otp}`,
      });
      res.json({ message: "Signup successful. Please verify your email." });
    } catch (err) {
      console.error("Signup error:", err);
      res.status(500).json({ error: "Signup failed" });
    }
  });

  // Verify OTP
  router.post("/verify-otp", async (req, res) => {
    let { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: "Email and OTP required" });
    email = email.trim().toLowerCase();
    console.log("OTP verify for:", email);
    try {
      const user = await db.collection("users").findOne({ email });
      if (!user) return res.status(404).json({ error: "User not found" });
      if (user.verified) return res.status(400).json({ error: "Already verified" });
      // Check OTP and expiry (10 min)
      const now = new Date();
      const created = user.otpCreatedAt || new Date(0);
      if (user.otp !== otp || (now - created) > 10 * 60 * 1000) {
        return res.status(400).json({ error: "Invalid or expired OTP" });
      }
      await db.collection("users").updateOne({ email }, { $set: { verified: true }, $unset: { otp: "", otpCreatedAt: "" } });
      console.log("User verified:", email);
      res.json({ message: "Email verified. You can now log in." });
    } catch (err) {
      console.error("OTP verify error:", err);
      res.status(500).json({ error: "Verification failed" });
    }
  });

  // Login
  router.post("/login", async (req, res) => {
    let { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    email = email.trim().toLowerCase();
    console.log("Login attempt:", email);
    try {
      const user = await db.collection("users").findOne({ email });
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      if (!user.verified) {
        console.log("Login failed, not verified:", email);
        return res.status(403).json({ error: "Email not verified. Please check your email for the OTP." });
      }
      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      console.log("Login success:", email);
      const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "2h" });
      res.json({ message: "Login successful", token });
    } catch (err) {
      console.error("Login error:", err);
      res.status(500).json({ error: "Login failed" });
    }
  });

  return router;
}; 