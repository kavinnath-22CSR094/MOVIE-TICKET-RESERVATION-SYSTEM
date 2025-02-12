require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect("mongodb+srv://arkavinnath:mAmFqPooaxSqYotp@cluster0.vp28h.mongodb.net/", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ MongoDB Connection Error:", err));

// User Schema
const UserSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    otp: String,
    otpExpires: Date
});
const User = mongoose.model("User", UserSchema);

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Generate OTP
const generateOTP = () => crypto.randomInt(100000, 999999).toString();

// **1. Register User (Send OTP)**
app.post("/register", async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists! Please login." });

        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 min validity

        const newUser = new User({ username, email, password: hashedPassword, otp, otpExpires });
        await newUser.save();

        // Send OTP Email
        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: "OTP Verification",
            text: `Your OTP for Reserving Movie Ticket is: ${otp}. It is valid for 5 minutes.`
        };
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) return res.status(500).json({ message: "Error sending OTP!" });
            res.json({ message: "OTP sent! Please verify." });
        });

    } catch (error) {
        res.status(500).json({ message: "Server error!" });
    }
});

// **2. Verify OTP & Login**
app.post("/verify-otp", async (req, res) => {
    const { email, otp } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found!" });

        if (user.otp !== otp || new Date() > user.otpExpires) {
            return res.status(400).json({ message: "Invalid or expired OTP!" });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });

        user.otp = null;
        user.otpExpires = null;
        await user.save();

        res.json({ message: "Login successful!", token });

    } catch (error) {
        res.status(500).json({ message: "Server error!" });
    }
});

// **3. Login with Username & Password**
app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ message: "User not found!" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid password!" });

        // Generate JWT token
        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.json({ message: "Login successful!", token });

    } catch (error) {
        res.status(500).json({ message: "Server error!" });
    }
});

// **4. Fetch User Data**
app.get('/user', async (req, res) => {
    const token = req.headers['authorization'].split(' ')[1];
    if (!token) return res.status(401).json({ message: "Unauthorized!" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password");
        res.json({ username: user.username });
    } catch (err) {
        res.status(401).json({ message: "Invalid token!" });
    }
});

// **5. Protected Route**
app.get("/profile", async (req, res) => {
    const token = req.headers.authorization;

    if (!token) return res.status(401).json({ message: "Unauthorized!" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password");
        res.json(user);
    } catch (err) {
        res.status(401).json({ message: "Invalid token!" });
    }
});

// Start Server
app.listen(5000, () => console.log("🚀 Server running on port 5000"));