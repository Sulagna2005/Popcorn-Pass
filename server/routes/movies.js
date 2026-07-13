const express = require("express");
const router = express.Router();
const axios = require("axios");
const axiosRetry = require("axios-retry").default;

const tmdbApi = axios.create({
  baseURL: "https://api.themoviedb.org/3",
  timeout: 10000,
  headers: { Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}` },
});

axiosRetry(tmdbApi, {
  retries: 3,
  retryDelay: (retryCount) => retryCount * 1000,
  retryCondition: (error) =>
    axiosRetry.isNetworkError(error) ||
    axiosRetry.isRetryableError(error) ||
    error.code === "ECONNRESET",
});

// GET /api/movies - popular movies
router.get("/", async (req, res) => {
  try {
    const response = await tmdbApi.get("/movie/popular");
    res.json(response.data.results);
  } catch (error) {
    res.status(500).json({ error: "Error fetching movies" });
  }
});

// GET /api/movies/bycity?city=Mumbai
router.get("/bycity", async (req, res) => {
  const { city } = req.query;
  if (!city) return res.status(400).json({ error: "city param required" });
  try {
    const Showtime = require("../models/Showtime");
    const City = require("../models/City");
    const cityDoc = await City.findOne({ name: new RegExp(`^${city}$`, "i") });
    if (!cityDoc) return res.status(404).json({ error: "City not found" });

    // Get unique movies directly from embedded showtime data — no TMDB calls needed
    const showtimes = await Showtime.find({ city: cityDoc._id, status: "active" })
      .select("movie")
      .lean();

    const seen = new Set();
    const movies = [];
    for (const st of showtimes) {
      if (!seen.has(st.movie.tmdbId)) {
        seen.add(st.movie.tmdbId);
        movies.push({
          id: st.movie.tmdbId,
          title: st.movie.title,
          poster_path: st.movie.posterPath,
          backdrop_path: st.movie.backdropPath || null,
          vote_average: st.movie.voteAverage || 0,
          release_date: st.movie.releaseDate || "",
          overview: st.movie.overview || "",
          original_language: st.movie.language || "hi",
          genre_ids: st.movie.genreIds || [],
        });
      }
    }
    res.json(movies);
  } catch (err) {
    res.status(500).json({ error: "Error fetching movies by city" });
  }
});

// GET /api/movies/upcoming — movies from DB sorted by release date desc
router.get("/upcoming", async (req, res) => {
  try {
    const Showtime = require("../models/Showtime");
    const showtimes = await Showtime.find({ status: "active" }).select("movie").lean();
    const seen = new Set();
    const movies = [];
    for (const st of showtimes) {
      if (!seen.has(st.movie.tmdbId)) {
        seen.add(st.movie.tmdbId);
        movies.push({ id: st.movie.tmdbId, title: st.movie.title, poster_path: st.movie.posterPath, backdrop_path: st.movie.backdropPath || null, vote_average: st.movie.voteAverage || 0, release_date: st.movie.releaseDate || "", overview: st.movie.overview || "", original_language: st.movie.language || "en", genre_ids: st.movie.genreIds || [] });
      }
    }
    movies.sort((a, b) => new Date(b.release_date) - new Date(a.release_date));
    res.json(movies.slice(0, 20));
  } catch (error) {
    res.status(500).json({ error: "Error fetching upcoming movies" });
  }
});

// GET /api/movies/toprated — movies from DB sorted by vote_average desc
router.get("/toprated", async (req, res) => {
  try {
    const Showtime = require("../models/Showtime");
    const showtimes = await Showtime.find({ status: "active" }).select("movie").lean();
    const seen = new Set();
    const movies = [];
    for (const st of showtimes) {
      if (!seen.has(st.movie.tmdbId)) {
        seen.add(st.movie.tmdbId);
        movies.push({ id: st.movie.tmdbId, title: st.movie.title, poster_path: st.movie.posterPath, backdrop_path: st.movie.backdropPath || null, vote_average: st.movie.voteAverage || 0, release_date: st.movie.releaseDate || "", overview: st.movie.overview || "", original_language: st.movie.language || "en", genre_ids: st.movie.genreIds || [] });
      }
    }
    movies.sort((a, b) => b.vote_average - a.vote_average);
    res.json(movies.slice(0, 20));
  } catch (error) {
    res.status(500).json({ error: "Error fetching top rated movies" });
  }
});

// GET /api/movies/nowplaying
router.get("/nowplaying", async (req, res) => {
  try {
    const response = await tmdbApi.get("/movie/now_playing");
    res.json(response.data.results);
  } catch (error) {
    res.status(500).json({ error: "Error fetching now playing movies" });
  }
});

// GET /api/movies/search?q=
router.get("/search", async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: "Query param q is required" });
  try {
    const response = await tmdbApi.get("/search/movie", { params: { query: q } });
    res.json(response.data.results);
  } catch (error) {
    res.status(500).json({ error: "Error searching movies" });
  }
});

// GET /api/movies/:id - movie detail
router.get("/:id", async (req, res) => {
  try {
    const [detail, credits, videos] = await Promise.all([
      tmdbApi.get(`/movie/${req.params.id}`),
      tmdbApi.get(`/movie/${req.params.id}/credits`),
      tmdbApi.get(`/movie/${req.params.id}/videos`),
    ]);
    const trailer = videos.data.results.find(v => v.type === "Trailer" && v.site === "YouTube") || null;
    res.json({
      ...detail.data,
      cast: credits.data.cast.slice(0, 10),
      trailer,
    });
  } catch (error) {
    // Fallback to DB cache if TMDB is unreachable
    try {
      const Showtime = require("../models/Showtime");
      const cached = await Showtime.findOne({ "movie.tmdbId": parseInt(req.params.id) }).select("movie").lean();
      if (!cached) return res.status(404).json({ error: "Movie not found" });
      const m = cached.movie;
      res.json({
        id: m.tmdbId, title: m.title, poster_path: m.posterPath, backdrop_path: m.backdropPath,
        overview: m.overview, release_date: m.releaseDate, vote_average: m.voteAverage,
        original_language: m.language, genre_ids: m.genreIds, genres: [], runtime: null, cast: [], trailer: null,
      });
    } catch { res.status(500).json({ error: "Error fetching movie detail" }); }
  }
});

module.exports = router;
