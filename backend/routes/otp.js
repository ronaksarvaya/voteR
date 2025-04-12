const express = require("express");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const transporter = require("../utils/mailer");

const router = express.Router();
const otpMemoryStore = new Map(); // key: collegeId, value: { otp, expiresAt }

const generateOTP = () => crypto.randomInt(100000, 999999).toString();

module.exports = (db) => {
  // Send OTP
  router.post("/send-otp", async (req, res) => {
    const { collegeId } = req.body;
    if (!collegeId) return res.status(400).json({ error: "College ID is required" });

    try {
      const student = await db.collection("students").findOne({ "ID no": parseInt(collegeId) });
      if (!student) return res.status(404).json({ error: "Student not found" });

      const email = student["Student email"];
      const otp = generateOTP();
      const expiresAt = Date.now() + 10 * 60 * 1000;
      otpMemoryStore.set(collegeId, { otp, expiresAt });
      console.log(`OTP stored for ${collegeId}:`, otpMemoryStore.get(collegeId));

      setTimeout(() => otpMemoryStore.delete(collegeId), 10 * 60 * 1000);

      const mailOptions = {
        from: `"CR Voting" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Your OTP for CR Voting",
        text: `Hello ${student["Full Name"]},\n\nYour OTP is ${otp}. It will expire in 10 minutes.`,
      };

      await transporter.sendMail(mailOptions);
      console.log(`Sent OTP ${otp} to ${email}`);
      res.json({ message: "OTP sent successfully" });
    } catch (err) {
      console.error("Error:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Verify OTP
  router.post("/verify-otp", async (req, res) => {
    const { collegeId, otp } = req.body;
    const record = otpMemoryStore.get(collegeId);
    if (!record) return res.status(400).json({ error: "No OTP found. Try requesting again." });

    if (Date.now() > record.expiresAt) {
      otpMemoryStore.delete(collegeId);
      return res.status(400).json({ error: "OTP expired. Please request again." });
    }

    if (record.otp !== otp) return res.status(401).json({ error: "Incorrect OTP." });

    otpMemoryStore.delete(collegeId);

    try {
      const student = await db.collection("students").findOne({ "ID no": parseInt(collegeId) });
      if (!student) return res.status(404).json({ error: "Student not found" });

      const fullName = student["Full Name"];
      const token = jwt.sign({ collegeId, fullName, role: "user" }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      res.json({ message: "OTP verified", token });
    } catch (err) {
      console.error("Error fetching student for token:", err);
      res.status(500).json({ error: "Server error generating token" });
    }
  });

  return router;
};
