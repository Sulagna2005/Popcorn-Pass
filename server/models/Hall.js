const mongoose = require("mongoose");

const hallSchema = new mongoose.Schema({
  cinema: { type: mongoose.Schema.Types.ObjectId, ref: "Cinema", required: true },
  name: { type: String, required: true },
  type: { type: String, enum: ["Standard", "Gold", "IMAX", "4DX"], required: true },
  totalSeats: { type: Number, required: true },
  rows: { type: Number, required: true },
  seatsPerRow: { type: Number, required: true },
  pricing: {
    silver: { type: Number },
    gold: { type: Number },
    platinum: { type: Number },
  },
});

module.exports = mongoose.model("Hall", hallSchema);
