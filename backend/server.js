// backend/server.js

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ MongoDB Connection Error:", err));

// User Schema
const UserSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
});
const User = mongoose.model("User", UserSchema);

// Movie Schema
const MovieSchema = new mongoose.Schema({
    name: { type: String, required: true },
    imageUrl: { type: String, required: true },
    genres: { type: [String], required: true },
    status: { type: String, enum: ["upcoming", "now playing"], required: true },
});
const Movie = mongoose.model("Movie", MovieSchema);

app.get("/api/auth/user", async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized!" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password");
        res.json({ username: user.username });
    } catch (error) {
        res.status(401).json({ message: "Invalid token!" });
    }
});

// Middleware to check if user is an admin
const isAdmin = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized!" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== "admin") return res.status(403).json({ message: "Forbidden!" });
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token!" });
    }
};

// Register User
const sendOTPEmail = async (email, otp) => {
    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: "OTP Verification",
        text: `Your OTP for registration is: ${otp}. It is valid for 5 minutes.`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("OTP email sent successfully!");
    } catch (error) {
        console.error("Error sending OTP email:", error);
        throw new Error("Error sending OTP email");
    }
};
app.post("/api/auth/register", async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();
        res.json({ message: "User registered successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Error registering user!" });
    }
});

// Login User
app.post("/api/auth/login", async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ message: "User not found!" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid password!" });

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.json({ message: "Login successful!", token });
    } catch (error) {
        res.status(500).json({ message: "Error logging in!" });
    }
});

// Admin Login
app.post("/api/auth/admin/login", async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username, role: "admin" });
        if (!user) return res.status(404).json({ message: "Admin not found!" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid password!" });

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.json({ message: "Admin login successful!", token });
    } catch (error) {
        res.status(500).json({ message: "Error logging in!" });
    }
});

// Add Movie (Admin Only)
app.post("/api/movies", isAdmin, async (req, res) => {
    const { name, imageUrl, genres, status } = req.body;
    try {
        const newMovie = new Movie({ name, imageUrl, genres, status });
        await newMovie.save();
        res.json({ message: "Movie added successfully!", movie: newMovie });
    } catch (error) {
        res.status(500).json({ message: "Error adding movie!" });
    }
});

// Get Movies
app.get("/api/movies", async (req, res) => {
    const { status } = req.query;
    try {
        const movies = await Movie.find({ status });
        res.json(movies);
    } catch (error) {
        res.status(500).json({ message: "Error fetching movies!" });
    }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));