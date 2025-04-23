const express = require("express");
const router = express.Router();

module.exports = (db) => {
  const students = db.collection("students");

  router.get("/:idNo", async (req, res) => {
    const idNo = parseInt(req.params.idNo);
    const student = await db.collection("students").findOne({ "ID no": idNo });
    if (!student) return res.status(404).json({ error: "Not found" });
    res.json(student);
  });
  

  router.post("/", async (req, res) => {
    const idNo = req.body.idNo;
    const role = req.body.role;
    const manifesto = req.body.manifesto;

    try {
      const student = await students.findOne({ "ID no": parseInt(idNo) });

      if (!student) {
        return res.status(404).json({ error: "Student not found" });
      }

      // 🚫 Check if already registered
      if (student.registered) {
        return res.status(400).json({ error: "You have already registered." });
      }

      console.log("Student found:", student);

      const updateData = {
        registered: true,
        role: role,
      };

      if (role === "candidate") {
        updateData.approved = false;
        updateData.manifesto = manifesto || "";
      }

      console.log("Update Data:", updateData);

      const result = await students.updateOne(
        { "ID no": parseInt(idNo) },
        { $set: updateData }
      );

      console.log("Update result:", result);

      if (result.modifiedCount > 0) {
        res.json({ message: "Registration successful", role: role });
      } else {
        res.status(400).json({ error: "No changes were made" });
      }

    } catch (err) {
      console.error("Registration error:", err);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  return router;
};
