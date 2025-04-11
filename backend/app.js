require("dotenv").config();
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const { MongoClient } = require("mongodb");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());

app.use(cors({
  origin: "https://vote-r.vercel.app",
  credentials: true 
}));


// MongoDB Setup
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);
let db;

async function connectToDB() {
  await client.connect();
  db = client.db("voteR");
  console.log("Connected to MongoDB");
}

// In-Memory OTP Store
const otpMemoryStore = new Map(); // key: collegeId, value: { otp, expiresAt }

// Email Setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};


app.get("/",(req,res)=>{
  res.send("backend started")
})
// Send OTP Route
app.post("/send-otp", async (req, res) => {
  const { collegeId } = req.body;

  if (!collegeId) {
    return res.status(400).json({ error: "College ID is required" });
  }

  try {
    const collection = db.collection("students");
    const student = await collection.findOne({ "ID no": parseInt(collegeId) });

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    const email = student["Student email"];
    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000;

    otpMemoryStore.set(collegeId, { otp, expiresAt });
    setTimeout(() => otpMemoryStore.delete(collegeId), 10 * 60 * 1000); // auto-expire

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

// Verify OTP Route
app.post("/verify-otp", async (req, res) => {
  const { collegeId, otp } = req.body;

  const record = otpMemoryStore.get(collegeId);
  if (!record) {
    return res.status(400).json({ error: "No OTP found. Try requesting again." });
  }

  if (Date.now() > record.expiresAt) {
    otpMemoryStore.delete(collegeId);
    return res.status(400).json({ error: "OTP expired. Please request again." });
  }

  if (record.otp !== otp) {
    return res.status(401).json({ error: "Incorrect OTP." });
  }

  otpMemoryStore.delete(collegeId);

  // Fetch student details to embed full name
  try {
    const collection = db.collection("students");
    const student = await collection.findOne({ "ID no": parseInt(collegeId) });

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    const fullName = student["Full Name"];

    const token = jwt.sign(
      { collegeId, fullName, role: "user" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    

    res.json({ message: "OTP verified", token });
  } catch (err) {
    console.error("Error fetching student for token:", err);
    res.status(500).json({ error: "Server error generating token" });
  }
});
// Get user details (used in User.jsx)
app.get("/user-details", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ fullName: payload.fullName });
  } catch (err) {
    console.error("Invalid token:", err);
    res.status(401).json({ error: "Invalid or expired token" });
  }
});

// Admin Dashboard Routes starts


app.get("/admin/students", async (req, res) => {
  try {
    const students = await db.collection("students").find().toArray();
    res.json(students);
  } catch (err) {
    console.error("Error fetching students:", err);
    res.status(500).json({ error: "Failed to fetch students" });
  }
});








app.get("/admin/pending-candidates", async (req, res) => {
  try {
    const pending = await db.collection("students").find({
      registeredAs: "candidate",
      candidateApproved: false
    }).toArray();

    res.json(pending);
  } catch (err) {
    console.error("Error fetching pending candidates:", err);
    res.status(500).json({ error: "Failed to fetch pending candidates" });
  }
});


//admin and dummy user
app.post("/direct-login", (req, res) => {
  const { collegeId } = req.body;

  let fullName;
  if (collegeId === "admin_ronak") {
    fullName = "Admin Ronak";
  } else if (collegeId === "user_ronak") {
    fullName = "Dummy User";
  } else {
    return res.status(403).json({ error: "Unauthorized ID for direct login" });
  }

  const role = collegeId === "admin_ronak" ? "admin" : "user";
  const token = jwt.sign(
    { collegeId, fullName, role },
    process.env.JWT_SECRET,
    { expiresIn: "2h" }
  );
  

  res.json({ message: "Direct login successful", token });
});





//to chnage this part is just for testing 


app.get("/admin/votes", async (req, res) => {
  try {
    const votes = await db.collection("votes").find().toArray();
    res.json(votes);
  } catch (err) {
    console.error("Error fetching votes:", err);
    res.status(500).json({ error: "Failed to fetch votes" });
  }
});


//til here test



// Admin Dashboard Route ends















const PORT = process.env.PORT || 5000;
connectToDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to DB", err);
  });


module.exports = app;
