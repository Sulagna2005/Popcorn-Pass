const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const Seat = require("../models/Seat");
const Showtime = require("../models/Showtime");
const User = require("../models/User");
const crypto = require("crypto");
const Razorpay = require("razorpay");
const jwt = require("jsonwebtoken");

const getRazorpay = () => new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Helper — extract user from JWT
function getUserFromToken(req) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return null;
  try { return jwt.verify(auth.split(" ")[1], process.env.JWT_SECRET); }
  catch { return null; }
}

// POST /api/bookings/create-order — create Razorpay order
router.post("/create-order", async (req, res) => {
  const { totalAmount } = req.body;
  if (!totalAmount) return res.status(400).json({ error: "totalAmount required" });
  try {
    const razorpay = getRazorpay();
    console.log("Razorpay key:", process.env.RAZORPAY_KEY_ID);
    const order = await razorpay.orders.create({
      amount: totalAmount * 100, // paise
      currency: "INR",
      receipt: "receipt_" + crypto.randomBytes(4).toString("hex"),
    });
    res.json({ orderId: order.id, amount: order.amount, currency: order.currency,
               key: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    console.error("Razorpay error:", err.message || err);
    res.status(500).json({ error: "Failed to create payment order", detail: err.message });
  }
});

// POST /api/bookings — confirm booking after payment verification
router.post("/", async (req, res) => {
  const { showtimeId, seatIds, sessionId, user: userInfo, totalAmount,
          razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!showtimeId || !seatIds?.length || !sessionId || !totalAmount)
    return res.status(400).json({ error: "Missing required fields" });

  try {
    // Verify Razorpay signature
    if (razorpay_order_id && razorpay_payment_id && razorpay_signature) {
      const expected = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");
      if (expected !== razorpay_signature)
        return res.status(400).json({ error: "Payment verification failed" });
    }

    // Verify all seats are locked by this session
    const seats = await Seat.find({ _id: { $in: seatIds }, showtime: showtimeId });
    const notLocked = seats.filter(s => s.status !== "locked" || s.lockedBy !== sessionId);
    if (notLocked.length > 0)
      return res.status(409).json({ error: "Seat lock expired. Please reselect seats." });

    // Resolve user — logged in user or create/find guest
    const tokenUser = getUserFromToken(req);
    let userId;
    if (tokenUser) {
      userId = tokenUser.id;
    } else {
      // Find or create guest user by email
      let guestUser = await User.findOne({ email: userInfo.email });
      if (!guestUser) {
        const bcrypt = require("bcryptjs");
        guestUser = await User.create({
          name: userInfo.name || "Guest",
          email: userInfo.email,
          phone: userInfo.phone || "0000000000",
          passwordHash: await bcrypt.hash(crypto.randomBytes(8).toString("hex"), 8),
        });
      }
      userId = guestUser._id;
    }

    // Mark seats as booked
    await Seat.updateMany({ _id: { $in: seatIds } },
      { status: "booked", lockedAt: null, lockedBy: null });

    // Decrement available seats
    await Showtime.findByIdAndUpdate(showtimeId, { $inc: { availableSeats: -seatIds.length } });
    const showtime = await Showtime.findById(showtimeId);
    if (showtime.availableSeats <= 0)
      await Showtime.findByIdAndUpdate(showtimeId, { status: "soldout" });

    const bookingId = "PP-" + crypto.randomBytes(4).toString("hex").toUpperCase();
    const seatCodes = seats.map(s => s.seatCode);

    const booking = await Booking.create({
      bookingId,
      user: userId,
      showtime: showtimeId,
      seats: seatIds,
      seatCodes,
      totalAmount,
      paymentId: razorpay_payment_id || null,
    });

    res.status(201).json({ booking, bookingId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error confirming booking" });
  }
});

// GET /api/bookings/my — get bookings for logged-in user
router.get("/my", async (req, res) => {
  const user = getUserFromToken(req);
  if (!user) return res.status(401).json({ error: "Login required" });
  try {
    const bookings = await Booking.find({ user: user.id })
      .populate({
        path: "showtime",
        populate: [
          { path: "cinema", select: "name chain address" },
          { path: "hall", select: "name type" },
          { path: "city", select: "name" },
        ],
      })
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch { res.status(500).json({ error: "Error fetching bookings" }); }
});

// GET /api/bookings/:bookingId
router.get("/:bookingId", async (req, res) => {
  try {
    const booking = await Booking.findOne({ bookingId: req.params.bookingId })
      .populate({
        path: "showtime",
        populate: [
          { path: "cinema", select: "name chain address" },
          { path: "hall", select: "name type" },
          { path: "city", select: "name state" },
        ],
      });
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    res.json(booking);
  } catch { res.status(500).json({ error: "Error fetching booking" }); }
});

module.exports = router;
