const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  bookingId: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  showtime: { type: mongoose.Schema.Types.ObjectId, ref: "Showtime", required: true },
  seats: [{ type: mongoose.Schema.Types.ObjectId, ref: "Seat" }],
  seatCodes: [{ type: String }],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ["confirmed", "cancelled"], default: "confirmed" },
  paymentId: { type: String, default: null },
  cancelledAt: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model("Booking", bookingSchema);
