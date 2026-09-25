const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Admin = require("../models/AdminModel");

const admin = express.Router();

admin.post("/api/admin/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }
        const adminUser = await Admin.findOne({
            email: email.trim().toLowerCase()
        });
        if (!adminUser) {
            return res.status(401).json({
                message: "Invalid admin credentials"
            });
        }
        const passwordMatch = await bcrypt.compare(
            password,
            adminUser.password
        );
        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid admin credentials"
            });
        }
        const token = jwt.sign(
            {
                adminId: adminUser._id,
                email: adminUser.email,
                role: adminUser.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );
        res.cookie("adminToken", token, {
            httpOnly: true,
            secure: false, // true in production with HTTPS
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        res.status(200).json({
            message: "Admin login successful",
            admin: {
                id: adminUser._id,
                name: adminUser.name,
                email: adminUser.email,
                role: adminUser.role
            }
        });
    } catch (error) {
        res.status(500).json({
            message: "Server error"
        });
    }
});
admin.post("/api/admin/logout", (req, res) => {
    res.clearCookie("adminToken", {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    });
    res.json({
        message: "Admin logged out successfully"
    });
});

module.exports = admin;