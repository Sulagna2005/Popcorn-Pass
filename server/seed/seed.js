const mongoose = require("mongoose");
require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });

const City = require("../models/City");
const Cinema = require("../models/Cinema");
const Hall = require("../models/Hall");
const Showtime = require("../models/Showtime");
const Seat = require("../models/Seat");
const axios = require("axios");
const axiosRetry = require("axios-retry").default;

const tmdbApi = axios.create({
  baseURL: "https://api.themoviedb.org/3",
  timeout: 15000,
  headers: { Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}` },
});

axiosRetry(tmdbApi, {
  retries: 5,
  retryDelay: (retryCount) => retryCount * 2000,
  retryCondition: (error) =>
    axiosRetry.isNetworkError(error) ||
    axiosRetry.isRetryableError(error) ||
    error.code === "ECONNRESET",
});

const SHOWTIMES = ["10:00 AM", "6:00 PM", "9:30 PM"];
const ADVANCE_DAYS = 14;

// City → primary language(s) for TMDB with_original_language filter
const CITY_LANGUAGES = {
  Mumbai:        ["hi", "mr"],
  Delhi:         ["hi"],
  Bangalore:     ["kn", "hi"],
  Chennai:       ["ta", "hi"],
  Hyderabad:     ["te", "hi"],
  Pune:          ["hi", "mr"],
  Kolkata:       ["bn", "hi"],
  Ahmedabad:     ["gu", "hi"],
  Jaipur:        ["hi"],
  Kochi:         ["ml", "hi"],
  Lucknow:       ["hi"],
  Chandigarh:    ["hi", "pa"],
  Indore:        ["hi"],
  Bhopal:        ["hi"],
  Nagpur:        ["hi", "mr"],
  Surat:         ["gu", "hi"],
  Visakhapatnam: ["te", "hi"],
  Coimbatore:    ["ta"],
  Bhubaneswar:   ["or", "hi"],
  Guwahati:      ["as", "hi"],
};

// Fetch all movies by language once, then assign to cities
async function fetchAllMoviesByLanguage() {
  const languages = ['hi', 'en', 'ta', 'te', 'bn', 'ml', 'kn', 'mr', 'gu', 'pa'];
  const moviesByLang = {};
  const seen = new Set();

  for (const lang of languages) {
    moviesByLang[lang] = [];
    try {
      const [popular, nowPlaying] = await Promise.all([
        tmdbApi.get("/movie/popular", { params: { with_original_language: lang, region: "IN" } }),
        tmdbApi.get("/movie/now_playing", { params: { with_original_language: lang, region: "IN" } }),
      ]);
      const combined = [...popular.data.results, ...nowPlaying.data.results];
      for (const m of combined) {
        if (!seen.has(m.id)) { seen.add(m.id); }
        moviesByLang[lang].push(m);
      }
      console.log(`  Lang ${lang}: ${moviesByLang[lang].length} movies`);
    } catch (e) {
      console.warn(`  Failed lang ${lang}:`, e.message);
    }
    await new Promise(r => setTimeout(r, 1000));
  }
  return moviesByLang;
}

function buildCityMovies(cityName, moviesByLang) {
  const langs = CITY_LANGUAGES[cityName] || ['hi'];
  const primaryLangs = langs.filter(l => l !== 'en');
  const seen = new Set();
  const local = [];
  const english = [];

  for (const lang of primaryLangs) {
    for (const m of (moviesByLang[lang] || [])) {
      if (!seen.has(m.id)) { seen.add(m.id); local.push(m); }
    }
  }

  // Pad with max 4 English movies only if needed
  for (const m of (moviesByLang['en'] || [])) {
    if (english.length >= 4) break;
    if (!seen.has(m.id)) { seen.add(m.id); english.push(m); }
  }

  return [...local, ...english].slice(0, 20);
}

const CITIES = [
  { name: "Mumbai", state: "Maharashtra", tier: "tier1" },
  { name: "Delhi", state: "Delhi", tier: "tier1" },
  { name: "Bangalore", state: "Karnataka", tier: "tier1" },
  { name: "Chennai", state: "Tamil Nadu", tier: "tier1" },
  { name: "Hyderabad", state: "Telangana", tier: "tier1" },
  { name: "Pune", state: "Maharashtra", tier: "tier2" },
  { name: "Kolkata", state: "West Bengal", tier: "tier1" },
  { name: "Ahmedabad", state: "Gujarat", tier: "tier2" },
  { name: "Jaipur", state: "Rajasthan", tier: "tier2" },
  { name: "Kochi", state: "Kerala", tier: "tier2" },
  { name: "Lucknow", state: "Uttar Pradesh", tier: "tier2" },
  { name: "Chandigarh", state: "Punjab", tier: "tier2" },
  { name: "Indore", state: "Madhya Pradesh", tier: "tier2" },
  { name: "Bhopal", state: "Madhya Pradesh", tier: "tier2" },
  { name: "Nagpur", state: "Maharashtra", tier: "tier2" },
  { name: "Surat", state: "Gujarat", tier: "tier2" },
  { name: "Visakhapatnam", state: "Andhra Pradesh", tier: "tier2" },
  { name: "Coimbatore", state: "Tamil Nadu", tier: "tier3" },
  { name: "Bhubaneswar", state: "Odisha", tier: "tier3" },
  { name: "Guwahati", state: "Assam", tier: "tier3" },
];

const CINEMAS_BY_CITY = {
  Mumbai: [
    { name: "PVR Juhu", chain: "PVR", address: "Juhu, Mumbai" },
    { name: "INOX Nariman Point", chain: "INOX", address: "Nariman Point, Mumbai" },
    { name: "Cinepolis Andheri", chain: "Cinepolis", address: "Andheri West, Mumbai" },
    { name: "PVR Phoenix Palladium", chain: "PVR", address: "Lower Parel, Mumbai" },
  ],
  Delhi: [
    { name: "PVR Select Citywalk", chain: "PVR", address: "Saket, Delhi" },
    { name: "INOX Nehru Place", chain: "INOX", address: "Nehru Place, Delhi" },
    { name: "Cinepolis DLF", chain: "Cinepolis", address: "Vasant Kunj, Delhi" },
    { name: "PVR Ambience Mall", chain: "PVR", address: "Vasant Kunj, Delhi" },
  ],
  Bangalore: [
    { name: "PVR Forum Mall", chain: "PVR", address: "Koramangala, Bangalore" },
    { name: "INOX Garuda Mall", chain: "INOX", address: "Magrath Road, Bangalore" },
    { name: "Cinepolis Orion Mall", chain: "Cinepolis", address: "Rajajinagar, Bangalore" },
  ],
  Chennai: [
    { name: "PVR VR Chennai", chain: "PVR", address: "Anna Nagar, Chennai" },
    { name: "INOX Escape", chain: "INOX", address: "Royapettah, Chennai" },
    { name: "Cinepolis Marina Mall", chain: "Cinepolis", address: "ECR, Chennai" },
  ],
  Hyderabad: [
    { name: "PVR Inorbit Mall", chain: "PVR", address: "Madhapur, Hyderabad" },
    { name: "INOX GVK One", chain: "INOX", address: "Banjara Hills, Hyderabad" },
    { name: "Cinepolis Sudha", chain: "Cinepolis", address: "Kukatpally, Hyderabad" },
  ],
  Pune: [
    { name: "PVR Phoenix Marketcity", chain: "PVR", address: "Viman Nagar, Pune" },
    { name: "INOX Bund Garden", chain: "INOX", address: "Bund Garden Road, Pune" },
    { name: "Cinepolis Amanora", chain: "Cinepolis", address: "Hadapsar, Pune" },
  ],
  Kolkata: [
    { name: "PVR Acropolis", chain: "PVR", address: "Kasba, Kolkata" },
    { name: "INOX South City", chain: "INOX", address: "Prince Anwar Shah Road, Kolkata" },
    { name: "Miraj Cinemas Kolkata", chain: "Miraj", address: "Salt Lake, Kolkata" },
  ],
  Ahmedabad: [
    { name: "PVR Iscon Mega Mall", chain: "PVR", address: "SG Highway, Ahmedabad" },
    { name: "INOX Himalaya Mall", chain: "INOX", address: "Drive-In Road, Ahmedabad" },
    { name: "Cinepolis AlphaOne", chain: "Cinepolis", address: "Vastrapur, Ahmedabad" },
  ],
  Jaipur: [
    { name: "PVR Crystal Palm", chain: "PVR", address: "Bani Park, Jaipur" },
    { name: "INOX Raj Mandir", chain: "INOX", address: "Bhagwan Das Road, Jaipur" },
    { name: "Carnival Jaipur", chain: "Carnival", address: "Malviya Nagar, Jaipur" },
  ],
  Kochi: [
    { name: "PVR Lulu Mall", chain: "PVR", address: "Edapally, Kochi" },
    { name: "INOX Oberon Mall", chain: "INOX", address: "Edapally, Kochi" },
    { name: "Cinepolis Centre Square", chain: "Cinepolis", address: "MG Road, Kochi" },
  ],
  Lucknow: [
    { name: "PVR Phoenix Palassio", chain: "PVR", address: "Gomti Nagar, Lucknow" },
    { name: "INOX Fun Republic", chain: "INOX", address: "Gomti Nagar, Lucknow" },
    { name: "Miraj Cinemas Lucknow", chain: "Miraj", address: "Hazratganj, Lucknow" },
  ],
  Chandigarh: [
    { name: "PVR Elante Mall", chain: "PVR", address: "Industrial Area, Chandigarh" },
    { name: "INOX Sector 17", chain: "INOX", address: "Sector 17, Chandigarh" },
  ],
  Indore: [
    { name: "PVR C21 Mall", chain: "PVR", address: "AB Road, Indore" },
    { name: "Carnival Indore", chain: "Carnival", address: "Vijay Nagar, Indore" },
  ],
  Bhopal: [
    { name: "PVR DB City", chain: "PVR", address: "Arera Hills, Bhopal" },
    { name: "Miraj Cinemas Bhopal", chain: "Miraj", address: "MP Nagar, Bhopal" },
  ],
  Nagpur: [
    { name: "PVR Eternity Mall", chain: "PVR", address: "Sitabuldi, Nagpur" },
    { name: "INOX Empress City", chain: "INOX", address: "Empress City, Nagpur" },
  ],
  Surat: [
    { name: "PVR VR Surat", chain: "PVR", address: "Dumas Road, Surat" },
    { name: "Cinepolis Dream Square", chain: "Cinepolis", address: "Adajan, Surat" },
  ],
  Visakhapatnam: [
    { name: "PVR CMR Central", chain: "PVR", address: "Dwaraka Nagar, Visakhapatnam" },
    { name: "INOX Vizag", chain: "INOX", address: "Beach Road, Visakhapatnam" },
  ],
  Coimbatore: [
    { name: "PVR Brookefields", chain: "PVR", address: "Brookefields Mall, Coimbatore" },
    { name: "Carnival Coimbatore", chain: "Carnival", address: "RS Puram, Coimbatore" },
  ],
  Bhubaneswar: [
    { name: "Miraj Cinemas Bhubaneswar", chain: "Miraj", address: "Saheed Nagar, Bhubaneswar" },
    { name: "Carnival Bhubaneswar", chain: "Carnival", address: "Patia, Bhubaneswar" },
  ],
  Guwahati: [
    { name: "PVR Dona Planet", chain: "PVR", address: "GS Road, Guwahati" },
    { name: "Miraj Cinemas Guwahati", chain: "Miraj", address: "Fancy Bazar, Guwahati" },
  ],
};

const HALL_TEMPLATES = {
  tier1: [
    { name: "Audi 1", type: "IMAX", rows: 15, seatsPerRow: 20, pricing: { silver: 400, gold: 500, platinum: null } },
    { name: "Audi 2", type: "4DX", rows: 8, seatsPerRow: 10, pricing: { silver: 500, gold: 600, platinum: null } },
    { name: "Audi 3", type: "Gold", rows: 10, seatsPerRow: 10, pricing: { silver: 250, gold: 350, platinum: null } },
    { name: "Audi 4", type: "Standard", rows: 13, seatsPerRow: 16, pricing: { silver: 150, gold: 200, platinum: 250 } },
  ],
  tier2: [
    { name: "Audi 1", type: "Gold", rows: 10, seatsPerRow: 10, pricing: { silver: 200, gold: 300, platinum: null } },
    { name: "Audi 2", type: "Standard", rows: 12, seatsPerRow: 15, pricing: { silver: 120, gold: 180, platinum: 220 } },
    { name: "Audi 3", type: "Standard", rows: 10, seatsPerRow: 14, pricing: { silver: 120, gold: 180, platinum: 220 } },
  ],
  tier3: [
    { name: "Audi 1", type: "Standard", rows: 10, seatsPerRow: 14, pricing: { silver: 100, gold: 150, platinum: null } },
    { name: "Audi 2", type: "Standard", rows: 8, seatsPerRow: 12, pricing: { silver: 100, gold: 150, platinum: null } },
  ],
};

function getSeatCategory(rowIndex, totalRows, hallType) {
  if (hallType === "Standard") {
    if (rowIndex < totalRows * 0.4) return "silver";
    if (rowIndex < totalRows * 0.75) return "gold";
    return "platinum";
  }
  return rowIndex < totalRows * 0.5 ? "silver" : "gold";
}

function getDateStrings() {
  const dates = [];
  for (let i = 0; i < ADVANCE_DAYS; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    dates.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
  }
  return dates;
}

function parseStartDateTime(dateStr, timeStr) {
  const [hour, rest] = timeStr.split(":");
  const [min, period] = rest.split(" ");
  let h = parseInt(hour);
  if (period === "PM" && h !== 12) h += 12;
  if (period === "AM" && h === 12) h = 0;
  const dt = new Date(dateStr);
  dt.setHours(h, parseInt(min), 0, 0);
  return dt;
}

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  await Promise.all([
    City.deleteMany({}),
    Cinema.deleteMany({}),
    Hall.deleteMany({}),
    Showtime.deleteMany({}),
    Seat.deleteMany({}),
  ]);
  console.log("Cleared existing data");

  const cityDocs = await City.insertMany(CITIES);
  const cityMap = {};
  cityDocs.forEach(c => { cityMap[c.name] = c; });
  console.log(`Seeded ${cityDocs.length} cities`);

  const allCinemas = [];
  for (const cityDoc of cityDocs) {
    const list = CINEMAS_BY_CITY[cityDoc.name] || [];
    for (const c of list) allCinemas.push({ ...c, city: cityDoc._id });
  }
  const cinemaDocs = await Cinema.insertMany(allCinemas);
  console.log(`Seeded ${cinemaDocs.length} cinemas`);

  const allHalls = [];
  for (const cinema of cinemaDocs) {
    const city = cityDocs.find(c => c._id.equals(cinema.city));
    const templates = HALL_TEMPLATES[city.tier];
    for (const t of templates) {
      allHalls.push({
        cinema: cinema._id,
        name: t.name,
        type: t.type,
        rows: t.rows,
        seatsPerRow: t.seatsPerRow,
        totalSeats: t.rows * t.seatsPerRow,
        pricing: t.pricing,
      });
    }
  }
  const hallDocs = await Hall.insertMany(allHalls);
  console.log(`Seeded ${hallDocs.length} halls`);

  const dates = getDateStrings();
  let showtimeCount = 0;
  const rowLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  // Fetch all movies by language once (avoids rate limiting)
  console.log('Fetching movies by language...');
  const moviesByLang = await fetchAllMoviesByLanguage();

  // Build city movie map from pre-fetched data
  const cityMovieMap = {};
  for (const cityDoc of cityDocs) {
    cityMovieMap[cityDoc.name] = buildCityMovies(cityDoc.name, moviesByLang);
    console.log(`${cityDoc.name}: ${cityMovieMap[cityDoc.name].length} movies`);
  }

  for (const hall of hallDocs) {
    const cinema = cinemaDocs.find(c => c._id.equals(hall.cinema));
    const city = cityDocs.find(c => c._id.equals(cinema.city));
    const cityMovies = cityMovieMap[city.name] || [];
    const hallMovies = [...cityMovies].sort(() => 0.5 - Math.random()).slice(0, 3);

    const showtimeDocs = [];
    for (const movie of hallMovies) {
      for (const date of dates) {
        for (const time of SHOWTIMES) {
          showtimeDocs.push({
            movie: {
              tmdbId: movie.id,
              title: movie.title,
              posterPath: movie.poster_path,
              backdropPath: movie.backdrop_path || null,
              overview: movie.overview || "",
              releaseDate: movie.release_date || "",
              voteAverage: movie.vote_average || 0,
              language: movie.original_language || "hi",
              genreIds: movie.genre_ids || [],
            },
            hall: hall._id,
            cinema: cinema._id,
            city: city._id,
            date,
            time,
            startDateTime: parseStartDateTime(date, time),
            availableSeats: hall.totalSeats,
            totalSeats: hall.totalSeats,
          });
        }
      }
    }

    const insertedShowtimes = await Showtime.insertMany(showtimeDocs);
    showtimeCount += insertedShowtimes.length;
    console.log(`Hall done: ${cinema.name} — ${hall.name} | ${insertedShowtimes.length} showtimes`);
  }

  console.log(`Seeded ${showtimeCount} showtimes`);
  console.log("Seed complete ✅");
  mongoose.disconnect();
}

seed().catch(err => {
  console.error(err);
  mongoose.disconnect();
});
