const mongoose = require("mongoose");

const showtimeSchema = new mongoose.Schema({
  movie: {
    tmdbId: { type: Number, required: true },
    title: { type: String, required: true },
    posterPath: { type: String },
    backdropPath: { type: String },
    overview: { type: String },
    releaseDate: { type: String },
    voteAverage: { type: Number },
    language: { type: String },
    genreIds: [{ type: Number }],
  },
  hall: { type: mongoose.Schema.Types.ObjectId, ref: "Hall", required: true },
  cinema: { type: mongoose.Schema.Types.ObjectId, ref: "Cinema", required: true },
  city: { type: mongoose.Schema.Types.ObjectId, ref: "City", required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  startDateTime: { type: Date, required: true },
  availableSeats: { type: Number, required: true },
  totalSeats: { type: Number, required: true },
  status: { type: String, enum: ["active", "soldout", "cancelled"], default: "active" },
});

showtimeSchema.index({ "movie.tmdbId": 1, city: 1, date: 1 });

module.exports = mongoose.model("Showtime", showtimeSchema);
