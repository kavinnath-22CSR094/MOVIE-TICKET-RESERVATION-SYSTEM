const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  availableSeats: [
    {
      row: String,
      seatNumber: Number,
      booked: { type: Boolean, default: false },
    },
  ],
});

module.exports = mongoose.model("Movie", movieSchema);
