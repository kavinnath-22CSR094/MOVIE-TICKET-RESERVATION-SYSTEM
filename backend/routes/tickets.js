const express = require("express");
const router = express.Router();
const Ticket = require("../models/Ticket");
const Movie = require("../models/Movie");
const authMiddleware = require("../middleware/authMiddleware"); // Ensure authentication

// 🎟️ BOOK TICKETS
router.post("/book", authMiddleware, async (req, res) => {
    try {
      const { user, movie, seats, date, time, totalAmount } = req.body;
  
      // ✅ Check if movie exists
      const movieData = await Movie.findById(movie);
      if (!movieData) return res.status(404).json({ message: "Movie not found" });
  
      // ✅ Ensure seats are available
      for (let seat of seats) {
        const existingSeat = movieData.availableSeats.find(
          (s) => s.row === seat.row && s.seatNumber === seat.seatNumber
        );
        if (!existingSeat || existingSeat.booked) {
          return res.status(400).json({ message: `Seat ${seat.row}${seat.seatNumber} is already booked!` });
        }
      }
  
      // ✅ Mark seats as booked in Movie collection
      movieData.availableSeats = movieData.availableSeats.map((s) => {
        if (seats.some((seat) => seat.row === s.row && seat.seatNumber === s.seatNumber)) {
          return { ...s, booked: true }; // ✅ Properly update each seat
        }
        return s;
      });
  
      await movieData.save(); // ✅ Ensure the movie document is updated
  
      // ✅ Save booking in Ticket collection
      const newTicket = new Ticket({
        user,
        movie,
        seats,
        date,
        time,
        totalAmount,
      });
      await newTicket.save();
  
      res.status(201).json({ message: "Booking successful!", ticket: newTicket });
    } catch (error) {
      console.error("❌ Booking failed:", error);
      res.status(500).json({ message: "Server error! Booking failed." });
    }
  });
  
module.exports = router;
