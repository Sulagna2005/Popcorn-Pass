const express = require("express");
const cors = require("cors");
const axios = require("axios");
const axiosRetry = require("axios-retry").default;
require("dotenv").config();

const app = express();
app.use(cors());

const tmdbApi = axios.create({
  baseURL: "https://api.themoviedb.org/3",
  timeout: 10000,
  headers: {
    Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
  },
});

axiosRetry(tmdbApi, {
  retries: 3,
  retryDelay: (retryCount) => retryCount * 1000,
});

app.get("/api/test", (req, res) => {
  res.json({ message: "API is working 🚀" });
});

app.get("/api/movies", async (req, res) => {
  try {
    const response = await tmdbApi.get("/movie/popular");
    res.json(response.data.results);
  } catch (error) {
    console.error("Code:", error.code);
    console.error("Message:", error.message);
    console.error("Details:", error.response?.data);
    res.status(500).json({ error: "Error fetching movies" });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
