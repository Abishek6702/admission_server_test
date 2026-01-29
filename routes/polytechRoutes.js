const express = require("express");

const Polytech = require("../models/PolyTech");

const router = express.Router();

// GET /college?search=
router.get("/", async (req, res) => {
  try {
    const search = req.query.search || "";
    const regex = new RegExp(search, "i");
    // const polytech = await Polytech.find({ polytech_name: regex }).sort({ polytech_name: 1 });

    let polytech = await Polytech
      .find({ polytech_name: regex })
      .sort({ polytech_name: 1 });

    // Always include "Others" as the last option
    polytech.push({ _id: "others", polytech_name: "Others" });

    res.json(polytech);
  } catch (err) {
    console.error("Error fetching schools:", err); // log actual error
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { polytech_name } = req.body;

    // Validate field
    if (!polytech_name || polytech_name.trim() === "") {
      return res.status(400).json({ error: "school_name is required" });
    }

    // Check for duplicates
    const existing = await Polytech.findOne({ polytech_name: polytech_name.trim() });
    if (existing) {
      return res.status(409).json({ error: "College already exists" });
    }

    // Save new school
    const newPolytech = new Polytech({ polytech_name:  polytech_name.trim() });
    await newPolytech.save();

    res.status(201).json({
      message: "College added successfully",
      polytech: newPolytech,
    });
  } catch (err) {
    console.error("Error adding school:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});
module.exports = router;
