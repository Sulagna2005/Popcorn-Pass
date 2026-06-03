const mongoose = require("mongoose");

const cinemaSchema = new mongoose.Schema({
  name: { type: String, required: true },
  chain: { type: String, enum: ["PVR", "INOX", "Cinepolis", "Miraj", "Carnival"], required: true },
  city: { type: mongoose.Schema.Types.ObjectId, ref: "City", required: true },
  address: { type: String, required: true },
});

module.exports = mongoose.model("Cinema", cinemaSchema);
