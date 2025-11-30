const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateResetToken() {
  return crypto.randomBytes(32).toString("hex");
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

  // Diagnostic endpoint to check configuration
  router.get("/check-config", (req, res) => {
    const config = {
      emailConfigured: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS),
      emailUser: process.env.EMAIL_USER ? "Set (hidden)" : "Not set",
      frontendUrl: process.env.FRONTEND_URL || "Not set (will use fallback)",
      jwtSecret: process.env.JWT_SECRET ? "Set (hidden)" : "Not set",
      mongoUri: process.env.MONGO_URI ? "Set (hidden)" : "Not set"
    };
    res.json(config);
  });

  // Signup
  router.post("/signup", async (req, res) => {
    let { email, password, skipVerification } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    email = email.trim().toLowerCase();
    console.log("Signup attempt:", email, "Skip verification:", skipVerification);
    try {
      const existing = await db.collection("users").findOne({ email });
      if (existing) {
        return res.status(409).json({ error: "Email already registered" });
      }
      const passwordHash = await bcrypt.hash(password, 10);
      const otp = generateOTP();
      
      // If skipVerification is true, mark user as verified immediately
      const user = {
        email,
        passwordHash,
        verified: skipVerification === true,
        otp: skipVerification ? undefined : otp,
        otpCreatedAt: skipVerification ? undefined : new Date(),
        createdAt: new Date(),
      };
      
      await db.collection("users").insertOne(user);
      
      // Send OTP email only if verification is not skipped
      if (!skipVerification) {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: "Your VoteR Verification OTP",
          text: `Your OTP for VoteR signup is: ${otp}\n\nThis OTP will expire in 10 minutes.`,
        });
        res.json({ message: "Signup successful. Please verify your email.", requiresVerification: true });
      } else {
        res.json({ message: "Signup successful. You can now log in.", requiresVerification: false });
      }
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

  // Resend OTP
  router.post("/resend-otp", async (req, res) => {
    let { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });
    email = email.trim().toLowerCase();
    console.log("Resend OTP for:", email);
    try {
      const user = await db.collection("users").findOne({ email });
      if (!user) return res.status(404).json({ error: "User not found" });
      if (user.verified) return res.status(400).json({ error: "Email already verified" });
      
      const otp = generateOTP();
      await db.collection("users").updateOne(
        { email },
        { $set: { otp, otpCreatedAt: new Date() } }
      );
      
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Your VoteR Verification OTP (Resent)",
        text: `Your new OTP for VoteR signup is: ${otp}\n\nThis OTP will expire in 10 minutes.`,
      });
      
      res.json({ message: "OTP resent successfully. Please check your email." });
    } catch (err) {
      console.error("Resend OTP error:", err);
      res.status(500).json({ error: "Failed to resend OTP" });
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

  // Forgot Password - Request reset
  router.post("/forgot-password", async (req, res) => {
    let { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    email = email.trim().toLowerCase();
    console.log("Password reset request for:", email);
    
    try {
      const user = await db.collection("users").findOne({ email });
      if (!user) {
        // Don't reveal if user exists or not for security
        console.log("User not found, but returning success message");
        return res.json({ message: "If the email exists, a password reset link has been sent." });
      }
      
      const resetToken = generateResetToken();
      const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
      
      await db.collection("users").updateOne(
        { email },
        { $set: { resetToken, resetTokenExpiry } }
      );
      console.log("Reset token saved to database");
      
      // Get frontend URL from environment or request origin
      const frontendUrl = process.env.FRONTEND_URL || 'https://vote-r.vercel.app';
      
      const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;
      console.log("Reset URL generated:", resetUrl);
      
      // Check if email credentials are configured
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error("Email credentials not configured");
        return res.status(500).json({ error: "Email service not configured. Please contact administrator." });
      }
      
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: "VoteR - Password Reset Request",
          html: `
            <h2>Password Reset Request</h2>
            <p>You requested to reset your password for VoteR.</p>
            <p>Click the link below to reset your password:</p>
            <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #248232; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
            <p>Or copy and paste this link in your browser:</p>
            <p>${resetUrl}</p>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this, please ignore this email.</p>
          `,
          text: `You requested to reset your password for VoteR.\n\nClick this link to reset your password: ${resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, please ignore this email.`,
        });
        console.log("Password reset email sent successfully to:", email);
      } catch (emailError) {
        console.error("Error sending email:", emailError);
        // Still return success to user but log the error
        return res.status(500).json({ 
          error: "Failed to send reset email. Please check email configuration or try again later." 
        });
      }
      
      res.json({ message: "If the email exists, a password reset link has been sent." });
    } catch (err) {
      console.error("Forgot password error:", err);
      res.status(500).json({ 
        error: "Failed to process password reset request. Please try again later." 
      });
    }
  });

  // Verify Reset Token
  router.post("/verify-reset-token", async (req, res) => {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: "Token is required" });
    }
    try {
      const user = await db.collection("users").findOne({ resetToken: token });
      if (!user) {
        return res.status(400).json({ error: "Invalid or expired reset token" });
      }
      
      const now = new Date();
      if (now > user.resetTokenExpiry) {
        return res.status(400).json({ error: "Reset token has expired" });
      }
      
      res.json({ message: "Token is valid", email: user.email });
    } catch (err) {
      console.error("Verify reset token error:", err);
      res.status(500).json({ error: "Failed to verify token" });
    }
  });

  // Reset Password - Set new password
  router.post("/reset-password", async (req, res) => {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ error: "Token and new password are required" });
    }
    console.log("Reset password with token");
    try {
      const user = await db.collection("users").findOne({ resetToken: token });
      if (!user) {
        return res.status(400).json({ error: "Invalid or expired reset token" });
      }
      
      const now = new Date();
      if (now > user.resetTokenExpiry) {
        return res.status(400).json({ error: "Reset token has expired" });
      }
      
      const passwordHash = await bcrypt.hash(newPassword, 10);
      
      await db.collection("users").updateOne(
        { resetToken: token },
        { 
          $set: { passwordHash },
          $unset: { resetToken: "", resetTokenExpiry: "" }
        }
      );
      
      console.log("Password reset successful for:", user.email);
      res.json({ message: "Password reset successful. You can now log in with your new password." });
    } catch (err) {
      console.error("Reset password error:", err);
      res.status(500).json({ error: "Failed to reset password" });
    }
  });

  return router;
};
