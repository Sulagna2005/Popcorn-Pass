const express = require("express");
const router = express.Router();
const Cinema = require("../models/Cinema");
const City = require("../models/City");

// GET /api/cinemas?city=Mumbai
router.get("/", async (req, res) => {
  try {
    const { city } = req.query;
    if (!city) return res.status(400).json({ error: "city query param is required" });

    const cityDoc = await City.findOne({ name: new RegExp(`^${city}$`, "i") });
    if (!cityDoc) return res.status(404).json({ error: "City not found" });

    const cinemas = await Cinema.find({ city: cityDoc._id });
    res.json(cinemas);
  } catch (error) {
    res.status(500).json({ error: "Error fetching cinemas" });
  }
});

// GET /api/cinemas/search?city=Mumbai&q=PVR
router.get("/search", async (req, res) => {
  try {
    const { city, q } = req.query;
    if (!city || !q) return res.status(400).json({ error: "city and q params required" });

    const cityDoc = await City.findOne({ name: new RegExp(`^${city}$`, "i") });
    if (!cityDoc) return res.status(404).json({ error: "City not found" });

    const cinemas = await Cinema.find({
      city: cityDoc._id,
      name: new RegExp(q, "i"),
    });
    res.json(cinemas);
  } catch (error) {
    res.status(500).json({ error: "Error searching cinemas" });
  }
});

module.exports = router;
