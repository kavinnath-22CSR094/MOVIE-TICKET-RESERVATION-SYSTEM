const express = require("express");
const { addMovie, getMovies } = require("../controllers/movieController");
const { isAdmin } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/movies", isAdmin, addMovie);
router.get("/movies", getMovies);

module.exports = router;