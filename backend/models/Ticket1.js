const mongoose = require("mongoose");

const TicketSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    movie: { type: mongoose.Schema.Types.ObjectId, ref: "Movie", required: true },
    seats: { type: [String], required: true },
    date: { type: String, required: true },
    time: { type: String, required: true, default: "7:00 PM" },  // ✅ Added default time
    totalAmount: { type: Number, required: true }
});

module.exports = mongoose.model("Ticket", TicketSchema);
