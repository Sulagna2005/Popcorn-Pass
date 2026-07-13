const mongoose = require("mongoose");
require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });

const City = require("../models/City");
const Cinema = require("../models/Cinema");
const Hall = require("../models/Hall");
const Showtime = require("../models/Showtime");
const Seat = require("../models/Seat");
// No TMDB calls needed — movies are hardcoded below

const SHOWTIMES = ["10:00 AM", "6:00 PM", "9:30 PM"];
const ADVANCE_DAYS = 14;

// Hardcoded movie list — mix of Hindi, Tamil, Telugu, Malayalam, English
const MOVIES = [
  { id: 1241982, title: "Moana 2", poster_path: "/yh64qw9mgXBvlaWDi7Q9tpUBAvH.jpg", backdrop_path: "/aosm8NMQ3UyoBVpSxyimorCQykC.jpg", overview: "Moana embarks on a new voyage.", release_date: "2024-11-27", vote_average: 7.0, original_language: "en", genre_ids: [16, 10751, 12] },
  { id: 762509, title: "Mufasa: The Lion King", poster_path: "/lurEK87kukWNaHd0zYnsi3yzJrs.jpg", backdrop_path: "/fqv8v6AycXKsivp1T5yKtLbGXce.jpg", overview: "The story of Mufasa's rise to king.", release_date: "2024-12-20", vote_average: 7.5, original_language: "en", genre_ids: [16, 10751, 18] },
  { id: 558449, title: "Gladiator II", poster_path: "/2cxhvwyEwRlysAmRH4iodkvo0z5.jpg", backdrop_path: "/euYIwmwkmz95mnXvufEJIE5MKHB.jpg", overview: "Years after witnessing the death of Maximus, Lucius is forced to enter the Colosseum.", release_date: "2024-11-15", vote_average: 6.8, original_language: "en", genre_ids: [28, 12, 18] },
  { id: 1100782, title: "Sonic the Hedgehog 3", poster_path: "/d8Ryb8AunYAuycVKDp5HpdWPKgC.jpg", backdrop_path: "/zOpe0eHsq0A2NvNyBbtT6sj53qV.jpg", overview: "Sonic, Knuckles and Tails reunite against a powerful new adversary.", release_date: "2024-12-20", vote_average: 7.8, original_language: "en", genre_ids: [28, 35, 878] },
  { id: 1184918, title: "The Wild Robot", poster_path: "/wTnV3PCVW5O92JMrFvvrRcV39RU.jpg", backdrop_path: "/417tYZ4XUyJrtyZXj7HpvWf1E8f.jpg", overview: "A robot stranded on an island learns to survive.", release_date: "2024-09-27", vote_average: 8.3, original_language: "en", genre_ids: [16, 878, 10751] },
  { id: 1022789, title: "Inside Out 2", poster_path: "/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg", backdrop_path: "/xg27NrXi7VXCGUr7MG75UqLl6Vg.jpg", overview: "Riley enters high school and new emotions arrive.", release_date: "2024-06-14", vote_average: 7.6, original_language: "en", genre_ids: [16, 10751, 18] },
  { id: 519182, title: "Despicable Me 4", poster_path: "/wWba3TaojhK7NdycyUPlLW0Wr7t.jpg", backdrop_path: "/lgkgICxmdIApHM9tTLdviyLBCQk.jpg", overview: "Gru and Lucy welcome a new member to the family.", release_date: "2024-07-03", vote_average: 7.1, original_language: "en", genre_ids: [16, 35, 10751] },
  { id: 573435, title: "Bad Boys: Ride or Die", poster_path: "/oGythE98MYleE6mZlGs5oBGkux1.jpg", backdrop_path: "/sWglBMnTdMFEECBqqFbFpFnFYaJ.jpg", overview: "Miami detectives Mike and Marcus are now on the run.", release_date: "2024-06-07", vote_average: 7.2, original_language: "en", genre_ids: [28, 80, 35] },
  { id: 1209290, title: "Pushpa 2: The Rule", poster_path: "/ie7AoeMfIBBcBkDVMJFMFGmGSHd.jpg", backdrop_path: "/9bXHaLMsyBmF1nEMBiSMFBiNFqy.jpg", overview: "Pushpa Raj expands his red sandalwood smuggling empire.", release_date: "2024-12-05", vote_average: 7.9, original_language: "te", genre_ids: [28, 80, 18] },
  { id: 1197306, title: "A Working Man", poster_path: "/6FRFIogh3zFnVWn7Z6zcYnIbRcX.jpg", backdrop_path: "/1HpRBdFCJCFPHPgKFGEqO3fvNmb.jpg", overview: "A man discovers his coworker is being trafficked.", release_date: "2025-03-28", vote_average: 7.0, original_language: "en", genre_ids: [28, 53] },
  { id: 986056, title: "Thunderbolts", poster_path: "/m9EtP1Yrzv6v7dMaC9mRaGhd1um.jpg", backdrop_path: "/m9EtP1Yrzv6v7dMaC9mRaGhd1um.jpg", overview: "A group of Marvel antiheroes assemble.", release_date: "2025-05-02", vote_average: 7.4, original_language: "en", genre_ids: [28, 12, 878] },
  { id: 1233413, title: "Snow White", poster_path: "/oQxrvHBHClFfGBopljhFCoW5O7o.jpg", backdrop_path: "/oQxrvHBHClFfGBopljhFCoW5O7o.jpg", overview: "A live-action retelling of Snow White.", release_date: "2025-03-21", vote_average: 6.2, original_language: "en", genre_ids: [14, 10749, 10751] },
  { id: 1170893, title: "Kalki 2898 AD", poster_path: "/4YpLSGDpFBMNFGOHBMFqnGHFBMN.jpg", backdrop_path: "/rcGOBtp2ThOKkFMnlGwOMfQg4Ql.jpg", overview: "A futuristic mythological epic set in 2898 AD.", release_date: "2024-06-27", vote_average: 7.5, original_language: "te", genre_ids: [28, 878, 14] },
  { id: 1011985, title: "Kung Fu Panda 4", poster_path: "/kDp1vUBnMpe8ak4rjgl3cLELqjU.jpg", backdrop_path: "/1XDDXPXGiI8id7MrUxK36ke7gkX.jpg", overview: "Po must train a new Dragon Warrior.", release_date: "2024-03-08", vote_average: 7.2, original_language: "en", genre_ids: [16, 28, 35] },
  { id: 748783, title: "The Garfield Movie", poster_path: "/xYduFGuch9OwbCOEUiNFMuPMeKg.jpg", backdrop_path: "/fgsHxz21B27hITCmChzEhPSPGAo.jpg", overview: "Garfield goes on a wild outdoor adventure.", release_date: "2024-05-24", vote_average: 6.8, original_language: "en", genre_ids: [16, 35, 10751] },
  { id: 1087822, title: "Devara: Part 1", poster_path: "/iHf6bFHuiMZHHiNKu0m3ZjMDMnL.jpg", backdrop_path: "/iHf6bFHuiMZHHiNKu0m3ZjMDMnL.jpg", overview: "A fearless man's legacy haunts his son.", release_date: "2024-09-27", vote_average: 6.5, original_language: "te", genre_ids: [28, 18, 53] },
  { id: 1064213, title: "Stree 2", poster_path: "/qNBAXBIQlnOThrVvA6mA2B5ggV6.jpg", backdrop_path: "/qNBAXBIQlnOThrVvA6mA2B5ggV6.jpg", overview: "The town of Chanderi faces a new supernatural threat.", release_date: "2024-08-15", vote_average: 8.1, original_language: "hi", genre_ids: [27, 35, 53] },
  { id: 1299613, title: "Singham Again", poster_path: "/singham_poster.jpg", backdrop_path: "/singham_backdrop.jpg", overview: "Singham returns for another action-packed mission.", release_date: "2024-11-01", vote_average: 6.9, original_language: "hi", genre_ids: [28, 80, 18] },
  { id: 1359977, title: "Munjya", poster_path: "/munjya_poster.jpg", backdrop_path: "/munjya_backdrop.jpg", overview: "A supernatural creature falls in love.", release_date: "2024-06-07", vote_average: 7.3, original_language: "hi", genre_ids: [27, 35, 10749] },
  { id: 1396452, title: "Manjummel Boys", poster_path: "/manjummel_poster.jpg", backdrop_path: "/manjummel_backdrop.jpg", overview: "A group of friends face a life-threatening situation.", release_date: "2024-02-22", vote_average: 8.5, original_language: "ml", genre_ids: [12, 18, 53] },
];

// City → preferred languages (used to pick relevant movies)
const CITY_LANGUAGES = {
  Mumbai: ["hi", "mr", "en"], Delhi: ["hi", "en"], Bangalore: ["kn", "hi", "en"],
  Chennai: ["ta", "hi", "en"], Hyderabad: ["te", "hi", "en"], Pune: ["hi", "mr", "en"],
  Kolkata: ["bn", "hi", "en"], Ahmedabad: ["gu", "hi", "en"], Jaipur: ["hi", "en"],
  Kochi: ["ml", "hi", "en"], Lucknow: ["hi", "en"], Chandigarh: ["hi", "en"],
  Indore: ["hi", "en"], Bhopal: ["hi", "en"], Nagpur: ["hi", "mr", "en"],
  Surat: ["gu", "hi", "en"], Visakhapatnam: ["te", "hi", "en"],
  Coimbatore: ["ta", "en"], Bhubaneswar: ["or", "hi", "en"], Guwahati: ["as", "hi", "en"],
};

function buildCityMovies(cityName) {
  const langs = CITY_LANGUAGES[cityName] || ["hi", "en"];
  const priority = MOVIES.filter(m => langs.slice(0, -1).includes(m.original_language));
  const english = MOVIES.filter(m => m.original_language === "en");
  const seen = new Set();
  const result = [];
  for (const m of [...priority, ...english]) {
    if (!seen.has(m.id)) { seen.add(m.id); result.push(m); }
    if (result.length >= 12) break;
  }
  return result;
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

  for (const hall of hallDocs) {
    const cinema = cinemaDocs.find(c => c._id.equals(hall.cinema));
    const city = cityDocs.find(c => c._id.equals(cinema.city));
    const cityMovies = buildCityMovies(city.name);
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
