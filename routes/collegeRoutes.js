const express = require("express");

const College = require("../models/College");

const router = express.Router();

// GET /college?search=
router.get("/", async (req, res) => {
  try {
    const search = req.query.search || "";
    const regex = new RegExp(search, "i");
    // const colleges = await College.find({ college_name: regex }).sort({ college_name: 1 });

    let colleges = await College.find({ college_name: regex }).sort({
      college_name: 1,
    });

    // Always include "Others" as the last option
    colleges.push({ _id: "others", college_name: "Others" });
    res.json(colleges);
  } catch (err) {
    console.error("Error fetching schools:", err); // log actual error
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { college_name } = req.body;

    // Validate field
    if (!college_name || college_name.trim() === "") {
      return res.status(400).json({ error: "school_name is required" });
    }

    // Check for duplicates
    const existing = await College.findOne({
      college_name: college_name.trim(),
    });
    if (existing) {
      return res.status(409).json({ error: "College already exists" });
    }

    // Save new school
    const newCollege = new College({ college_name: college_name.trim() });
    await newCollege.save();

    res.status(201).json({
      message: "College added successfully",
      college: newCollege,
    });
  } catch (err) {
    console.error("Error adding school:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});
module.exports = router;
