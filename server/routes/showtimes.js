const express = require("express");
const router = express.Router();
const Showtime = require("../models/Showtime");
const City = require("../models/City");

// GET /api/showtimes?movieId=&city=&date=
router.get("/", async (req, res) => {
  try {
    const { movieId, city, date } = req.query;
    if (!movieId || !city || !date)
      return res.status(400).json({ error: "movieId, city and date are required" });

    const cityDoc = await City.findOne({ name: new RegExp(`^${city}$`, "i") });
    if (!cityDoc) return res.status(404).json({ error: "City not found" });

    const showtimes = await Showtime.find({
      "movie.tmdbId": parseInt(movieId),
      city: cityDoc._id,
      date,
      status: "active",
    })
      .populate("cinema", "name chain address")
      .populate("hall", "name type pricing")
      .sort({ time: 1 });

    // Group by cinema
    const grouped = {};
    for (const st of showtimes) {
      const cinemaId = st.cinema._id.toString();
      if (!grouped[cinemaId]) {
        grouped[cinemaId] = {
          cinema: st.cinema,
          showtimes: [],
        };
      }
      grouped[cinemaId].showtimes.push({
        _id: st._id,
        time: st.time,
        hall: st.hall,
        availableSeats: st.availableSeats,
        totalSeats: st.totalSeats,
      });
    }

    res.json(Object.values(grouped));
  } catch (error) {
    res.status(500).json({ error: "Error fetching showtimes" });
  }
});

module.exports = router;
