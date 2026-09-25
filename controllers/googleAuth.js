const express = require("express");
const { google } = require("googleapis");
const jwt = require("jsonwebtoken");
const router = express.Router();
const User = require("../models/User");
const oauth2Client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_CALLBACK_URL);
router.get("/google", (req, res) => {
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: ["openid", "profile", "email"],
        prompt: "select_account"
    });
    res.redirect(authUrl);
});
router.get("/google/callback", async (req, res) => {
    try {
        const { code } = req.query;
        if (!code) {
            return res.status(400).send(
                "Google authorization failed"
            );
        }
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);
        const oauth2 = google.oauth2({
            auth: oauth2Client,
            version: "v2"
        });
        const { data } = await oauth2.userinfo.get();
        const { id: googleId, name, email } = data;
        if (!email) {
            return res.status(400).send(
                "Google account email not available"
            );
        }
        let user = await User.findOne({
            email: email.toLowerCase()
        });
        if (!user) {
            user = await User.create({
                name: name || "Google User",
                email: email.toLowerCase(),
                googleId: googleId,
                authProvider: "google"
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
        res.redirect(
            `${process.env.FRONTEND_URL}/`
        );
    } catch (error) {
        res.status(500).json({
            message:
                "Google authentication failed",
            error: error.message
        });
    }
});

module.exports = router;