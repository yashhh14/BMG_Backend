const jwt = require("jsonwebtoken");
const Admin = require("../models/AdminModel");
const adminMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies.adminToken;
        if (!token) {
            return res.status(401).json({
                message: "Admin authentication required"
            });
        }
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );
        if (decoded.role !== "admin") {
            return res.status(403).json({
                message: "Admin access denied"
            });
        }
        const admin = await Admin.findById(decoded.adminId);
        if (!admin) {
            return res.status(401).json({
                message: "Admin account not found"
            });
        }
        req.admin = admin;
        next();
    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired admin token"
        });
    }
};

module.exports = adminMiddleware;