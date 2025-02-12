const jwt = require("jsonwebtoken");

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

module.exports = { isAdmin };