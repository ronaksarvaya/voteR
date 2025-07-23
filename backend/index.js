require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());
app.use(cors({
  origin: [
    "https://vote-r.vercel.app", // your frontend domain
    "http://localhost:5173"      // (optional) local dev
  ],
  credentials: true
}));

// DB Connection
const uri = process.env.MONGO_URI

const client = new MongoClient(uri);
let db;

async function connectToDB() {
  await client.connect();
  db = client.db("voteR");
  console.log("Connected to MongoDB");

  // Load Routes
  const otpRoutes = require("./routes/otp")(db);
  const adminRoutes = require("./routes/admin")(db);
  const registerRoutes = require("./routes/register")(db);
  const authRoutes = require("./routes/auth")(db);
  const sessionRoutes = require("./routes/session")(db);
  app.use("/otp", otpRoutes);
  app.use("/admin", adminRoutes);
  app.use("/register", registerRoutes);
  app.use("/auth", authRoutes);
  app.use("/session", sessionRoutes);
}

app.get("/candidates", async (req, res) => {
  try {
    const candidates = await db
      .collection("students")
      .find({ role: "candidate", approved: true })
      .toArray();

    res.json(candidates);
  } catch (err) {
    console.error("Error fetching candidates:", err);
    res.status(500).json({ error: "Failed to fetch candidates" });
  }
});

app.post("/vote", async (req, res) => {
  try {
    const { voterId, candidateId } = req.body

    // Validate input
    if (!voterId || !candidateId) {
      return res.status(400).json({ error: "Voter ID and Candidate ID are required" })
    }

    // Check if voter exists and is registered
    const voter = await db.collection("students").findOne({ "ID no": Number.parseInt(voterId) })
    if (!voter) {
      return res.status(404).json({ error: "Voter not found" })
    }
    if (!voter.registered || voter.role !== "voter") {
      return res.status(403).json({ error: "You must be registered as a voter" })
    }

    // Check if candidate exists and is approved
    const candidate = await db.collection("students").findOne({
      "ID no": Number.parseInt(candidateId),
      role: "candidate",
      approved: true,
    })
    if (!candidate) {
      return res.status(404).json({ error: "Candidate not found or not approved" })
    }

    // Check if voter has already voted
    const existingVote = await db.collection("votes").findOne({ voterId: Number.parseInt(voterId) })
    if (existingVote) {
      return res.status(400).json({ error: "You have already voted" })
    }

    // Record the vote
    await db.collection("votes").insertOne({
      voterId: Number.parseInt(voterId),
      candidateId: Number.parseInt(candidateId),
      timestamp: new Date(),
    })

    res.json({ message: "Vote recorded successfully" })
  } catch (err) {
    console.error("Error recording vote:", err)
    res.status(500).json({ error: "Failed to record vote" })
  }
})




app.get("/", (req, res) => {
  res.send("Backend started");
});

// Direct login route
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
  const token = jwt.sign({ collegeId, fullName, role }, process.env.JWT_SECRET, {
    expiresIn: "2h",
  });

  res.json({ message: "Direct login successful", token });
});

app.get("/user-details", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token provided" });

  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ fullName: payload.fullName });
  } catch (err) {
    console.error("Invalid token:", err);
    res.status(401).json({ error: "Invalid or expired token" });
  }
});

const PORT = process.env.PORT || 10000;
connectToDB()
  .then(() => {
    app.listen(PORT,'0.0.0.0', () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to DB", err);
  });
