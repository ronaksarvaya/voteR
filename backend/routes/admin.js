const express = require("express");
const jwt = require("jsonwebtoken");

const router = express.Router();

module.exports = (db) => {
  router.get("/students", async (req, res) => {
    try {
      const students = await db.collection("students").find().toArray();
      res.json(students);
    } catch (err) {
      console.error("Error fetching students:", err);
      res.status(500).json({ error: "Failed to fetch students" });
    }
  });

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

  router.get("/votes", async (req, res) => {
    try {
      const votes = await db.collection("votes").find().toArray();
      res.json(votes);
    } catch (err) {
      console.error("Error fetching votes:", err);
      res.status(500).json({ error: "Failed to fetch votes" });
    }
  });

  return router;
};
