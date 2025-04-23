const express = require("express");
const jwt = require("jsonwebtoken");

const router = express.Router();

module.exports = (db) => {
  // Get all students
  router.get("/students", async (req, res) => {
    try {
      const students = await db.collection("students").find().toArray();
      res.json(students);
    } catch (err) {
      console.error("Error fetching students:", err);
      res.status(500).json({ error: "Failed to fetch students" });
    }
  });

  // Get all votes
  router.get("/votes", async (req, res) => {
    try {
      const votes = await db.collection("votes").find().toArray();
      res.json(votes);
    } catch (err) {
      console.error("Error fetching votes:", err);
      res.status(500).json({ error: "Failed to fetch votes" });
    }
  });

  // Get pending candidate approvals
  router.get("/pending-candidates", async (req, res) => {
    try {
      const pending = await db.collection("students").find({
        registeredAs: "candidate",
        candidateApproved: false,
      }).toArray();
      res.json(pending);
    } catch (err) {
      console.error("Error fetching pending candidates:", err);
      res.status(500).json({ error: "Failed to fetch pending candidates" });
    }
  });

  // ✅ Approve candidate
  router.post("/approve-candidate", async (req, res) => {
    const { collegeId } = req.body;
    if (!collegeId) {
      return res.status(400).json({ error: "Missing college ID" });
    }

    try {
      const result = await db.collection("students").updateOne(
        { "ID no": collegeId },
        { $set: { candidateApproved: true } }
      );

      if (result.modifiedCount === 0) {
        return res.status(404).json({ error: "Candidate not found or already approved" });
      }

      res.json({ message: "Candidate approved successfully" });
    } catch (err) {
      console.error("Error approving candidate:", err);
      res.status(500).json({ error: "Failed to approve candidate" });
    }
  });

  return router;
};
