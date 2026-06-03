const mongoose = require("mongoose");

const seatSchema = new mongoose.Schema({
  showtime: { type: mongoose.Schema.Types.ObjectId, ref: "Showtime", required: true },
  row: { type: String, required: true },
  number: { type: Number, required: true },
  seatCode: { type: String, required: true },
  category: { type: String, enum: ["silver", "gold", "platinum"], required: true },
  price: { type: Number, required: true },
  status: { type: String, enum: ["available", "locked", "booked"], default: "available" },
  lockedAt: { type: Date, default: null },
  lockedBy: { type: String, default: null },
});

seatSchema.index({ showtime: 1, status: 1 });

module.exports = mongoose.model("Seat", seatSchema);
