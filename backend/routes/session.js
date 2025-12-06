const express = require("express");
const { ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");

function generateSessionCode() {
  return Math.random().toString(36).substring(2, 10);
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token provided" });
  const token = authHeader.split(" ")[1];
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

module.exports = (db) => {
  const router = express.Router();

  // Create session
  router.post("/create", authMiddleware, async (req, res) => {
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    // Use userId from the authenticated token
    const ownerId = req.user.userId;

    let code;
    let exists = true;
    // Ensure unique code
    while (exists) {
      code = generateSessionCode();
      exists = await db.collection("sessions").findOne({ code });
    }

    const session = {
      title,
      code,
      ownerId: new ObjectId(ownerId),
      createdAt: new Date(),
    };

    await db.collection("sessions").insertOne(session);
    res.json({ message: "Session created", code });
  });

  // Get my sessions
  router.get("/my-sessions", authMiddleware, async (req, res) => {
    try {
      const ownerId = new ObjectId(req.user.userId);
      const sessions = await db.collection("sessions")
        .find({ ownerId })
        .sort({ createdAt: -1 })
        .toArray();

      res.json(sessions);
    } catch (err) {
      console.error("Error fetching user sessions:", err);
      res.status(500).json({ error: "Failed to fetch sessions" });
    }
  });

  // Get session by code
  router.get("/:code", async (req, res) => {
    const { code } = req.params;
    const session = await db.collection("sessions").findOne({ code });
    if (!session) return res.status(404).json({ error: "Session not found" });
    res.json({
      title: session.title,
      code: session.code,
      ownerId: session.ownerId,
      createdAt: session.createdAt,
      publicResults: !!session.publicResults,
    });
  });

  // Add candidate (admin only)
  router.post("/:code/candidate", authMiddleware, async (req, res) => {
    const { code } = req.params;
    const { name, manifesto } = req.body;
    if (!name) return res.status(400).json({ error: "Candidate name required" });
    const session = await db.collection("sessions").findOne({ code });
    if (!session) return res.status(404).json({ error: "Session not found" });
    if (session.ownerId.toString() !== req.user.userId) return res.status(403).json({ error: "Only session owner can add candidates" });
    const candidate = {
      sessionCode: code,
      name,
      manifesto: manifesto || "",
      createdAt: new Date(),
    };
    await db.collection("candidates").insertOne(candidate);
    res.json({ message: "Candidate added" });
  });

  // Delete candidate (admin only)
  router.delete("/:code/candidate/:candidateId", authMiddleware, async (req, res) => {
    const { code, candidateId } = req.params;
    const session = await db.collection("sessions").findOne({ code });

    if (!session) return res.status(404).json({ error: "Session not found" });
    if (session.ownerId.toString() !== req.user.userId) {
      return res.status(403).json({ error: "Only session owner can delete candidates" });
    }

    try {
      const result = await db.collection("candidates").deleteOne({
        _id: new ObjectId(candidateId),
        sessionCode: code
      });

      if (result.deletedCount === 0) {
        return res.status(404).json({ error: "Candidate not found" });
      }

      // Also delete associated votes? Optional but cleaner.
      await db.collection("votes").deleteMany({
        sessionCode: code,
        candidateId: candidateId
      });

      res.json({ message: "Candidate deleted successfully" });
    } catch (err) {
      console.error("Error deleting candidate:", err);
      res.status(500).json({ error: "Failed to delete candidate" });
    }
  });

  // List candidates
  router.get("/:code/candidates", async (req, res) => {
    const { code } = req.params;
    const candidates = await db.collection("candidates").find({ sessionCode: code }).toArray();
    res.json(candidates);
  });

  // Vote (one vote per user per session)
  router.post("/:code/vote", authMiddleware, async (req, res) => {
    const { code } = req.params;
    const { candidateId } = req.body;
    if (!candidateId) return res.status(400).json({ error: "Candidate ID required" });
    const session = await db.collection("sessions").findOne({ code });
    if (!session) return res.status(404).json({ error: "Session not found" });
    const candidate = await db.collection("candidates").findOne({ _id: new ObjectId(candidateId), sessionCode: code });
    if (!candidate) return res.status(404).json({ error: "Candidate not found" });
    // Check if user already voted
    const existing = await db.collection("votes").findOne({ sessionCode: code, userId: req.user.userId });
    if (existing) return res.status(400).json({ error: "You have already voted in this session" });
    await db.collection("votes").insertOne({
      sessionCode: code,
      userId: req.user.userId,
      candidateId,
      votedAt: new Date(),
    });
    res.json({ message: "Vote recorded" });
  });

  // Verify if user is session owner
  router.get("/:code/verify-owner", authMiddleware, async (req, res) => {
    const { code } = req.params;
    const session = await db.collection("sessions").findOne({ code });
    if (!session) return res.status(404).json({ error: "Session not found" });
    const isOwner = session.ownerId.toString() === req.user.userId;
    res.json({ isOwner });
  });

  // Toggle Public Results for Session
  router.put("/:code/settings/public", authMiddleware, async (req, res) => {
    const { code } = req.params;
    const { publicResults } = req.body;

    const session = await db.collection("sessions").findOne({ code });
    if (!session) return res.status(404).json({ error: "Session not found" });
    if (session.ownerId.toString() !== req.user.userId) {
      return res.status(403).json({ error: "Only session owner can change settings" });
    }

    try {
      await db.collection("sessions").updateOne(
        { code },
        { $set: { publicResults: !!publicResults } }
      );
      res.json({ message: "Settings updated", publicResults: !!publicResults });
    } catch (err) {
      console.error("Error updating settings:", err);
      res.status(500).json({ error: "Failed to update settings" });
    }
  });

  // List votes (for results) - Session Owner OR if Public
  router.get("/:code/votes", async (req, res) => {
    const { code } = req.params;
    const session = await db.collection("sessions").findOne({ code });
    if (!session) return res.status(404).json({ error: "Session not found" });

    // Check auth if private
    if (!session.publicResults) {
      authMiddleware(req, res, async () => {
        if (session.ownerId.toString() !== req.user.userId) {
          return res.status(403).json({ error: "Only session owner can view results" });
        }
        respondWithVotes();
      });
    } else {
      respondWithVotes();
    }

    async function respondWithVotes() {
      try {
        const votes = await db.collection("votes").find({ sessionCode: code }).toArray();
        res.json(votes);
      } catch (err) {
        res.status(500).json({ error: "Failed to fetch votes" });
      }
    }
  });

  // Delete session - Only owner can delete
  router.delete("/:code", authMiddleware, async (req, res) => {
    const { code } = req.params;
    const session = await db.collection("sessions").findOne({ code });
    if (!session) return res.status(404).json({ error: "Session not found" });

    // Check if user is the session owner
    if (session.ownerId.toString() !== req.user.userId) {
      return res.status(403).json({ error: "Only session owner can delete this session" });
    }

    try {
      // Delete session, candidates, and votes
      await db.collection("sessions").deleteOne({ code });
      await db.collection("candidates").deleteMany({ sessionCode: code });
      await db.collection("votes").deleteMany({ sessionCode: code });

      res.json({ message: "Session deleted successfully" });
    } catch (err) {
      console.error("Error deleting session:", err);
      res.status(500).json({ error: "Failed to delete session" });
    }
  });

  return router;
};
