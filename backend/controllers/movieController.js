const Movie = require("../models/Movie");

exports.addMovie = async (req, res) => {
    const { name, imageUrl, genres, status } = req.body;
    try {
        const newMovie = new Movie({ name, imageUrl, genres, status });
        await newMovie.save();
        res.json({ message: "Movie added successfully!", movie: newMovie });
    } catch (error) {
        res.status(500).json({ message: "Error adding movie!" });
    }
};

exports.getMovies = async (req, res) => {
    const { status } = req.query;
    try {
        const movies = await Movie.find({ status });
        res.json(movies);
    } catch (error) {
        res.status(500).json({ message: "Error fetching movies!" });
    }
};