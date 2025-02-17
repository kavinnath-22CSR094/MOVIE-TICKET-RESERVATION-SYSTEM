const mongoose = require("mongoose");

const TheaterSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String, required: true },
    movies: [
      {
        movieId: { type: mongoose.Schema.Types.ObjectId, ref: "Movie", required: true }, // Reference to Movie
        date: { type: String, required: true },
        time: { type: String, required: true },
      },
    ],
    seats: [
      {
        row: { type: String, required: true },
        seatNumber: { type: Number, required: true },
        booked: { type: Boolean, default: false },
      },
    ],
  });
  
  const Theater = mongoose.model("Theater", TheaterSchema);
  module.exports = Theater;
