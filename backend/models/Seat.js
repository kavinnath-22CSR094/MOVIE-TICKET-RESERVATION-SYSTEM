const mongoose = require("mongoose");

const SeatSchema = new mongoose.Schema({
    theaterId: mongoose.Schema.Types.ObjectId,
    movieId: mongoose.Schema.Types.ObjectId,
    date: String,
    time: String,
    row: String,
    seatNumber: Number,
    booked: { type: Boolean, default: false },
});

const Seat = mongoose.model("Seat", SeatSchema);
module.exports = Seat;
