const mongoose = require("mongoose");

const MovieSchema = new mongoose.Schema({
    name: { type: String, required: true },
    imageUrl: { type: String, required: true },
    genres: { type: [String], required: true },
    status: { type: String, enum: ["upcoming", "now playing"], required: true },
});

module.exports = mongoose.model("Movie", MovieSchema);