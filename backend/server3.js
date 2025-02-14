require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ MongoDB Connection Error:", err));

// ✅ Setup Email Transporter (Gmail Example)
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
    },
});

// ✅ User Schema
const UserSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
});
const User = mongoose.model("User", UserSchema);

// ✅ OTP Storage (Consider Redis for Production)
const otpStorage = new Map();

// ✅ Function to Send OTP Email
const sendOTPEmail = async (email, otp) => {
    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: "OTP Verification",
        text: `Your OTP for registration is: ${otp}. It is valid for 5 minutes.`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("✅ OTP email sent successfully!");
    } catch (error) {
        console.error("❌ Error sending OTP email:", error);
        throw new Error("Error sending OTP email");
    }
};

// ✅ Register User - Step 1: Generate and Send OTP
app.post("/api/auth/register", async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists!" });

        const otp = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit OTP
        otpStorage.set(email, { otp, expires: Date.now() + 300000 }); // Store OTP for 5 minutes

        await sendOTPEmail(email, otp); // Send OTP to user's email

        res.json({ message: "OTP sent successfully! Please verify your email." });
    } catch (error) {
        res.status(500).json({ message: "Error sending OTP!" });
    }
});

// ✅ Verify OTP and Register User
// Verify OTP and Register User
app.post("/api/auth/verify-otp", async (req, res) => {
    const { username, email, password, otp } = req.body;

    if (!username || !email || !password || !otp) {
        return res.status(400).json({ message: "All fields are required!" });
    }

    const storedData = otpStorage.get(email);
    console.log("Stored OTP:", storedData);
    console.log("Received OTP:", otp);
    console.log("Received OTP:", otp);
console.log("Stored OTP:", storedData?.otp);
console.log("Stored Expiry:", new Date(storedData?.expires));
console.log("Current Time:", new Date());


    if (!storedData) {
        return res.status(400).json({ message: "OTP expired or not found!" });
    }

    // Check if OTP is expired
    if (Date.now() > storedData.expires) {
        otpStorage.delete(email); // Remove expired OTP
        return res.status(400).json({ message: "OTP has expired!" });
    }
    if (!storedData) {
        return res.status(400).json({ message: "Invalid or expired OTP" }); // Unified message
    }
    
    if (Date.now() > storedData.expires) {
        otpStorage.delete(email);
        return res.status(400).json({ message: "Invalid or expired " }); // Unified message
    }
    
    // Ensure OTP types match
    if (storedData.otp !== Number(otp)) {
        return res.status(400).json({ message: "Invalid OTP!" });
    }

    otpStorage.delete(email); // Remove OTP after successful verification

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword });

        await newUser.save();
        res.json({ message: "User registered successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Error registering user!" });
    }
});

// ✅ Login User
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

// ✅ Middleware to Check if User is Admin
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

// ✅ Admin Login
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

// ✅ Movie Schema
const MovieSchema = new mongoose.Schema({
    name: { type: String, required: true },
    imageUrl: { type: String, required: true },
    genres: { type: [String], required: true },
    status: { type: String, enum: ["upcoming", "now playing"], required: true },
    availableSeats: [{ row: String, seatNumber: Number, booked: Boolean }] // ✅ Add this
});

const Movie = mongoose.model("Movie", MovieSchema);

// ✅ Add Movie (Admin Only)
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

app.get("/api/auth/user", async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("_id username"); // ✅ Return _id

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json(user); // ✅ Return user with _id
    } catch (error) {
        res.status(400).json({ error: "Invalid token" });
    }
});

  

// ✅ Get Movies
app.get("/api/movies", async (req, res) => {
    const { status } = req.query;
    try {
        const movies = await Movie.find(status ? { status } : {});
        res.json(movies);
    } catch (error) {
        res.status(500).json({ message: "Error fetching movies!" });
    }
});
const ticketSchema = new mongoose.Schema({
    movieId: { type: mongoose.Schema.Types.ObjectId, ref: "Movie", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    seats: [{
        row: { type: String, required: true },
        number: { type: Number, required: true }
    }],
    bookingDate: { type: Date, default: Date.now }
});
const Ticket = mongoose.model("Ticket", ticketSchema);


// ✅ Book Ticket Route (Fixes `userId` and `movieId` Error)

app.post("/api/book-ticket", async (req, res) => {
    try {
        console.log("Incoming Booking Request:", req.body); // Debugging log

        let { userId, movieId, seats } = req.body;

        // ✅ Validate userId and movieId
        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(movieId)) {
            return res.status(400).json({ message: "Invalid User ID or Movie ID!" });
        }
        userId = new mongoose.Types.ObjectId(userId);
        movieId = new mongoose.Types.ObjectId(movieId);

        // ✅ Fetch latest movie data
        const movieData = await Movie.findById(movieId);
        if (!movieData) return res.status(404).json({ message: "Movie not found!" });

        // ✅ Check seat availability
        let unavailableSeats = [];
        seats.forEach((seat) => {
            const seatExists = movieData.availableSeats.find(
                (s) => s.row === seat.row && s.seatNumber === seat.number
            );

            if (!seatExists) {
                unavailableSeats.push(`${seat.row}${seat.number}`);
            } else if (seatExists.booked === true) {
                unavailableSeats.push(`${seat.row}${seat.number}`);
            }
        });

        if (unavailableSeats.length > 0) {
            console.error(`❌ These seats are already booked: ${unavailableSeats.join(", ")}`);
            return res.status(400).json({ message: `Seats already booked: ${unavailableSeats.join(", ")}` });
        }

        // ✅ Update only booked seats in MongoDB
        for (let seat of seats) {
            await Movie.updateOne(
                { _id: movieId },
                { $set: { "availableSeats.$[elem].booked": true } },
                { arrayFilters: [{ "elem.row": { $in: seats.map(s => s.row) }, "elem.seatNumber": { $in: seats.map(s => s.number) } }] }
            );
            
        }
        
        // ✅ Save ticket in the database
        const newTicket = new Ticket({
            userId,
            movieId,
            seats,
            bookingDate: new Date(),
        });

        await newTicket.save();
        console.log("✅ Ticket saved successfully:", newTicket);

        res.status(201).json({ success: true, message: "Ticket booked successfully!", ticket: newTicket });
    } catch (error) {
        console.error("❌ Error booking ticket:", error);
        res.status(500).json({ message: "Server error! Booking failed." });
    }
});



// ✅ Get All Tickets Route
app.get("/api/tickets", async (req, res) => {
    try {
        const tickets = await Ticket.find().populate("movieId").populate("userId");
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ Get Booked Seats for a Movie
app.get("/api/movies/:id/booked-seats", async (req, res) => {
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

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
