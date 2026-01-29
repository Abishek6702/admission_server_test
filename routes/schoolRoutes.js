const express = require("express");

const School = require("../models/School.js");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const search = req.query.search || "";
    const regex = new RegExp(search, "i");

    let schools = await School.find({ school_name: regex }).sort({ school_name: 1 });

    // Always include "Others" as the last option
    schools.push({ _id: "others", school_name: "Others" });

    res.json(schools);
  } catch (err) {
    console.error("Error fetching schools:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});


router.post("/", async (req, res) => {
  try {
    const { school_name } = req.body;

    // Validate field
    if (!school_name || school_name.trim() === "") {
      return res.status(400).json({ error: "school_name is required" });
    }

    // Check for duplicates
    const existing = await School.findOne({ school_name: school_name.trim() });
    if (existing) {
      return res.status(409).json({ error: "School already exists" });
    }

    // Save new school
    const newSchool = new School({ school_name: school_name.trim() });
    await newSchool.save();

    res.status(201).json({
      message: "School added successfully",
      school: newSchool,
    });
  } catch (err) {
    console.error("Error adding school:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});
module.exports = router;
