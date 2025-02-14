const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    movie: { type: mongoose.Schema.Types.ObjectId, ref: "Movie", required: true },
    seats: [
      {
        row: { type: String, required: true },
        number: { type: Number, required: true },
      },
    ],
    date: { type: Date, required: true },
    time: { type: String, required: true },
    totalAmount: { type: Number, required: true },
  });
  

module.exports = mongoose.model("Ticket", ticketSchema);
