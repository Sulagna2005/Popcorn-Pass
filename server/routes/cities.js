const express = require("express");
const router = express.Router();
const City = require("../models/City");

// GET /api/cities
router.get("/", async (req, res) => {
  try {
    const cities = await City.find().sort({ name: 1 });
    res.json(cities);
  } catch (error) {
    res.status(500).json({ error: "Error fetching cities" });
  }
});

module.exports = router;
