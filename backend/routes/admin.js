const express = require("express");
const Theater = require("../models/Theater");
const router = express.Router();

// ✅ Add Theater Route
router.post("/add-theater", async (req, res) => {
    try {
        const { name, location, movies } = req.body;

        if (!name || !location || !movies) {
            return res.status(400).json({ message: "All fields are required!" });
        }

        const newTheater = new Theater({
            name,
            location,
            movies,
            seats: generateSeats(), // ✅ Auto-generate seat layout
        });

        await newTheater.save();
        res.json({ message: "Theater added successfully!" });
    } catch (error) {
        console.error("❌ Error adding theater:", error);
        res.status(500).json({ message: "Error adding theater!" });
    }
});

// ✅ Helper function to generate seats
function generateSeats() {
    let seats = [];
    ["A", "B", "C", "D", "E"].forEach(row => {
        for (let i = 1; i <= 10; i++) {
            seats.push({ row, seatNumber: i, booked: false });
        }
    });
    return seats;
}

module.exports = router;
