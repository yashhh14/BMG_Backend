const { setServers } = require("node:dns/promises");
setServers(["1.1.1.1", "8.8.8.8"]);
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./DB/connectdb");
connectDB();
const User = require("./models/User");
const authMiddleware = require("./middleware/authMiddleware");
const googleAuthRoutes = require("./controllers/googleAuth.js");
const auth = require("./controllers/loginSignupController.js");
const route = require("./controllers/travelServiceController.js");
const route2 = require("./controllers/singleTravelController.js");
const route3 = require("./controllers/adminPatchController.js");
const route4 = require("./controllers/adminDeleteController.js");
const route5 = require("./controllers/adminViewController.js");
const adminRoutes = require("./controllers/AdminLoginController.js");
const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: ["http://localhost:5173"],
    methods: ["GET","POST","PUT","PATCH","DELETE"],
    credentials: true
}));
app.use("/api/auth", googleAuthRoutes);
app.get("/api/me",authMiddleware,async (req, res) => {
        try {
            const user = await User.findById(
                req.user.userId
            ).select("-password");
            if (!user) {
                return res.status(404).json({
                    message: "User not found"
                });
            }
            res.json({
                user
            });
        } catch (error) {
            res.status(500).json({
                message: error.message
            });
        }
    }
);
app.use("/", auth);
app.use("/", route);
app.use("/", route2);
app.use("/", route3);
app.use("/", route4);
app.use(adminRoutes);
app.use("/", route5);
app.post("/api/logout", (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    });
    res.json({
        message: "Logged out successfully"
    });
});

app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
});