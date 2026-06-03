const express = require("express");
const router = express.Router();
const Seat = require("../models/Seat");
const Showtime = require("../models/Showtime");
const Hall = require("../models/Hall");

const LOCK_DURATION_MS = 10 * 60 * 1000;
const ROW_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function getSeatCategory(rowIndex, totalRows, hallType) {
  if (hallType === "Standard") {
    if (rowIndex < totalRows * 0.4) return "silver";
    if (rowIndex < totalRows * 0.75) return "gold";
    return "platinum";
  }
  return rowIndex < totalRows * 0.5 ? "silver" : "gold";
}

// GET /api/seats/:showtimeId - get seat map (generate on-demand if not in DB)
router.get("/:showtimeId", async (req, res) => {
  try {
    const showtimeId = req.params.showtimeId;

    // Release expired locks
    await Seat.updateMany(
      { showtime: showtimeId, status: "locked", lockedAt: { $lt: new Date(Date.now() - LOCK_DURATION_MS) } },
      { status: "available", lockedAt: null, lockedBy: null }
    );

    let seats = await Seat.find({ showtime: showtimeId }).sort({ row: 1, number: 1 });

    // Generate seats on-demand if not yet created
    if (seats.length === 0) {
      const showtime = await Showtime.findById(showtimeId).populate("hall");
      if (!showtime) return res.status(404).json({ error: "Showtime not found" });

      const hall = showtime.hall;
      const seatDocs = [];
      for (let r = 0; r < hall.rows; r++) {
        const rowLetter = ROW_LETTERS[r];
        const category = getSeatCategory(r, hall.rows, hall.type);
        const price = hall.pricing[category];
        for (let s = 1; s <= hall.seatsPerRow; s++) {
          seatDocs.push({ showtime: showtimeId, row: rowLetter, number: s, seatCode: `${rowLetter}${s}`, category, price, status: "available" });
        }
      }
      seats = await Seat.insertMany(seatDocs);
    }

    res.json(seats);
  } catch (error) {
    res.status(500).json({ error: "Error fetching seats" });
  }
});

// POST /api/seats/lock
router.post("/lock", async (req, res) => {
  const { showtimeId, seatIds, sessionId } = req.body;
  if (!showtimeId || !seatIds?.length || !sessionId)
    return res.status(400).json({ error: "showtimeId, seatIds and sessionId are required" });

  try {
    await Seat.updateMany(
      { showtime: showtimeId, status: "locked", lockedAt: { $lt: new Date(Date.now() - LOCK_DURATION_MS) } },
      { status: "available", lockedAt: null, lockedBy: null }
    );

    const seats = await Seat.find({ _id: { $in: seatIds }, showtime: showtimeId });
    const unavailable = seats.filter(s => s.status !== "available");
    if (unavailable.length > 0)
      return res.status(409).json({ error: "Some seats are no longer available", seats: unavailable.map(s => s.seatCode) });

    await Seat.updateMany(
      { _id: { $in: seatIds } },
      { status: "locked", lockedAt: new Date(), lockedBy: sessionId }
    );

    res.json({ success: true, expiresAt: new Date(Date.now() + LOCK_DURATION_MS) });
  } catch (error) {
    res.status(500).json({ error: "Error locking seats" });
  }
});

// POST /api/seats/unlock
router.post("/unlock", async (req, res) => {
  const { seatIds, sessionId } = req.body;
  if (!seatIds?.length || !sessionId)
    return res.status(400).json({ error: "seatIds and sessionId are required" });

  try {
    await Seat.updateMany(
      { _id: { $in: seatIds }, lockedBy: sessionId, status: "locked" },
      { status: "available", lockedAt: null, lockedBy: null }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Error unlocking seats" });
  }
});

module.exports = router;
