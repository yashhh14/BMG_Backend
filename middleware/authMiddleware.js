const jwt = require("jsonwebtoken");
const authMiddleware = (req, res, next) => {
    try {
        const token = req.cookies?.token;
        if (!token) {
            console.log("❌ No token found");
            return res.status(401).json({
                success: false,
                message: "Not authenticated"
            });
        }
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );
        req.user = decoded;
        next();
    } catch (error) {
        console.error(
            "❌ Authentication error:",
            error.message
        );
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
};

module.exports = authMiddleware;