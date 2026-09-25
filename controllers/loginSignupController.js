const express = require("express");
const auth = express.Router();
const User = require("../models/User.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


auth.post("/api/signup", async (req, res) => {
    try {
        const {name,email,phone,password} = req.body;
        if (!name || !email || !phone || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }
        const existingUser = await User.findOne({
            $or: [
                { email: email.trim().toLowerCase() },
                { phone: phone.trim() }
            ]
        });
        if (existingUser) {
            return res.status(409).json({
                message: "Email or phone number already registered"
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            phone: phone.trim(),
            password: hashedPassword,
            authProvider: "local"
        });
        res.status(201).json({
            message: "User created successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone
            }
        });
    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({
            message: error.message
        });
    }
});



auth.post("/api/login", async (req, res) => {
    try {
        const { phone, password } = req.body;
        if (!phone || !password) {
            return res.status(400).json({
                message: "Phone and password are required"
            });
        }
        const user = await User.findOne({
            phone: phone.trim()
        });
        if (!user) {
            return res.status(401).json({
                message: "Invalid phone number or password"
            });
        }
        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );
        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid phone number or password"
            });
        }
        const token = jwt.sign(
            {
                userId: user._id,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );
        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        res.status(200).json({
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone
            }
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({
            message: error.message
        });
    }
});

module.exports = auth;