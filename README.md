# 🍿 PopcornPass

A full-stack movie ticket booking web app for Indian audiences. Browse movies by city, pick showtimes, choose seats, and book tickets — all in one place.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS v4, React Router v7 |
| Backend | Node.js, Express 5, MongoDB Atlas, Mongoose |
| Auth | JWT + bcryptjs |
| Payments | Razorpay (test mode) |
| Movie Data | TMDB API |

---

## Features

- City-based movie discovery (20 Indian cities)
- Hero carousel + Now Showing / Coming Soon / Top Rated / Premieres rows
- Showtime listing grouped by cinema and hall type (IMAX, 4DX, Gold, Standard)
- Interactive seat picker with category-based pricing (Silver / Gold / Platinum)
- User auth (register / login)
- Booking confirmation with Razorpay payment integration
- My Bookings page
- Movie search

---

## Project Structure

```
Popcorn-Pass/
├── client/          # React frontend (Vite)
│   └── src/
│       ├── components/
│       ├── context/
│       └── pages/
└── server/          # Express backend
    ├── models/
    ├── routes/
    └── seed/
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- TMDB API access token
- Razorpay test keys

### 1. Clone the repo

```bash
git clone https://github.com/your-username/popcorn-pass.git
cd popcorn-pass
```

### 2. Setup the server

```bash
cd server
npm install
```

Create a `.env` file in `server/`:

```env
MONGO_URI=your_mongodb_atlas_uri
TMDB_ACCESS_TOKEN=your_tmdb_bearer_token
JWT_SECRET=your_jwt_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

Seed the database:

```bash
npm run seed
```

Start the server:

```bash
npm run dev       # development (nodemon)
npm start         # production
```

Server runs on `http://localhost:5000`.

### 3. Setup the client

```bash
cd client
npm install
npm run dev
```

Client runs on `http://localhost:5173` and proxies `/api` requests to the server.

---

## Seeding

The seed script populates:
- 20 cities across India (Tier 1 / 2 / 3)
- 53 cinemas with halls (IMAX, 4DX, Gold, Standard)
- 20 curated movies (Hindi, Telugu, Tamil, Malayalam, English)
- 21,000+ showtimes for the next 14 days

Re-run `npm run seed` any time to refresh showtimes with today's dates.

---

## API Routes

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/movies/bycity?city=` | Movies showing in a city |
| GET | `/api/movies/upcoming` | Upcoming movies |
| GET | `/api/movies/toprated` | Top rated movies |
| GET | `/api/movies/:id` | Movie detail + cast + trailer |
| GET | `/api/movies/search?q=` | Search movies |
| GET | `/api/showtimes?movieId=&city=&date=` | Showtimes grouped by cinema |
| GET | `/api/cities` | All cities |
| GET | `/api/seats/:showtimeId` | Seats for a showtime |
| POST | `/api/bookings` | Create a booking |
| GET | `/api/bookings/my` | User's bookings |
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login |

---

## Environment Notes

- The TMDB API is used for movie detail pages (posters, trailers, cast). If TMDB is unreachable on your network, movie detail pages fall back to cached DB data.
- Razorpay is in test mode. Use test card `4111 1111 1111 1111` for payments.
- MongoDB Atlas free tier clusters pause after inactivity — resume from the Atlas dashboard if the app stops loading data.
