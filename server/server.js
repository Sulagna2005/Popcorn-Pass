const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config({ override: true });

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB error:", err));

app.use("/api/auth", require("./routes/auth"));
app.use("/api/movies", require("./routes/movies"));
app.use("/api/cities", require("./routes/cities"));
app.use("/api/cinemas", require("./routes/cinemas"));
app.use("/api/showtimes", require("./routes/showtimes"));
app.use("/api/seats", require("./routes/seats"));
app.use("/api/bookings", require("./routes/bookings"));

app.get("/api/test", (req, res) => res.json({ message: "API is working 🚀" }));

app.listen(5000, '127.0.0.1', () => console.log("Server running on port 5000"));
