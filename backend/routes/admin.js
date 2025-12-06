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

  // ✅ Get pending candidate approvals (consistent field names)
  router.get("/pending-candidates", async (req, res) => {
    try {
      const pending = await db.collection("students").find({
        role: "candidate",
        registered: true,
        approved: false,
      }).toArray();
      res.json(pending);
    } catch (err) {
      console.error("Error fetching pending candidates:", err);
      res.status(500).json({ error: "Failed to fetch pending candidates" });
    }
  });

  // ✅ Approve candidate (consistent field names)
  router.post("/approve-candidate", async (req, res) => {
    const { collegeId } = req.body;
    if (!collegeId) {
      return res.status(400).json({ error: "Missing college ID" });
    }

    try {
      const result = await db.collection("students").updateOne(
        { "ID no": parseInt(collegeId) },
        { $set: { approved: true } }
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

  // Delete student/candidate
  router.delete("/student/:id", async (req, res) => {
    const { id } = req.params;
    try {
      const result = await db.collection("students").deleteOne({ "ID no": parseInt(id) });
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: "Student not found" });
      }
      res.json({ message: "Student deleted successfully" });
    } catch (err) {
      console.error("Error deleting student:", err);
      res.status(500).json({ error: "Failed to delete student" });
    }
  });

  // Settings: Get Public Results Flag
  router.get("/settings/public-results", async (req, res) => {
    try {
      const settings = await db.collection("settings").findOne({ type: "global" });
      res.json({ isPublic: settings ? !!settings.publicResults : false });
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  // Settings: Set Public Results Flag
  router.post("/settings/public-results", async (req, res) => {
    const { isPublic } = req.body;
    try {
      await db.collection("settings").updateOne(
        { type: "global" },
        { $set: { publicResults: !!isPublic } },
        { upsert: true }
      );
      res.json({ message: "Settings updated", isPublic: !!isPublic });
    } catch (err) {
      res.status(500).json({ error: "Failed to update settings" });
    }
  });

  // Public Results Endpoint
  router.get("/public/results", async (req, res) => {
    try {
      // Check setting
      const settings = await db.collection("settings").findOne({ type: "global" });
      if (!settings || !settings.publicResults) {
        return res.status(403).json({ error: "Results are not public yet." });
      }

      // Fetch aggregated votes
      const votes = await db.collection("votes").find().toArray();
      const candidates = await db.collection("students").find({ role: "candidate", approved: true }).toArray();

      // Similar logic to Admin dashboard
      const voteCount = {};
      candidates.forEach(c => {
        voteCount[c["ID no"]] = {
          id: c["ID no"],
          name: c["Full Name"],
          manifesto: c.manifesto || "",
          count: 0
        };
      });

      votes.forEach(v => {
        if (voteCount[v.candidateId]) {
          voteCount[v.candidateId].count++;
        }
      });

      const results = Object.values(voteCount)
        .sort((a, b) => b.count - a.count)
        .map(c => ({
          name: c.name,
          votes: c.count,
          percentage: votes.length > 0 ? Math.round((c.count / votes.length) * 100) : 0
        }));

      res.json({ totalVotes: votes.length, results });
    } catch (err) {
      console.error("Error fetching public results:", err);
      res.status(500).json({ error: "Failed to fetch results" });
    }
  });

  return router;
};
