// 🎭 GET BOOKED SEATS FOR A MOVIE
router.get("/:id/booked-seats", async (req, res) => {
    try {
      const movie = await Movie.findById(req.params.id);
      if (!movie) return res.status(404).json({ message: "Movie not found" });
  
      const bookedSeats = movie.availableSeats.filter((s) => s.booked);
      res.json(bookedSeats);
    } catch (error) {
      console.error("Error fetching booked seats:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  