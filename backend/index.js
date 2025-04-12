require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());
app.use(cors({ origin: "*", credentials: true }));

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

  app.use("/otp", otpRoutes);
  app.use("/admin", adminRoutes);
}

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

const PORT = process.env.PORT || 5000;
connectToDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to DB", err);
  });
