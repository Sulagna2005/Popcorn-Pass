const mongoose = require("mongoose");

const citySchema = new mongoose.Schema({
  name: { type: String, required: true },
  state: { type: String, required: true },
  tier: { type: String, enum: ["tier1", "tier2", "tier3"], required: true },
});

module.exports = mongoose.model("City", citySchema);
