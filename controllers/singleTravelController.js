const express = require("express");
const route = express.Router();
const User = require("../models/User.js");
const authMiddleware = require('../middleware/authMiddleware.js')
const { Train, Flight, Bus, Cab, Hotel } = require("../models/TravelServicesModel.js");

route.get("/api/trains/:trainNo", async (req, res) => {
    try {
        const { trainNo } = req.params;
        const train = await Train.findOne({
            trainNo: trainNo.trim()
        });
        if (!train) {
            return res.status(404).json({
                success: false,
                message: "Train not found"
            });
        }
        res.status(200).json({
            success: true,
            train
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

route.get("/api/flights/:flightNo", async (req, res) => {
    try {
        const { flightNo } = req.params;
        const flight = await Flight.findOne({
            flightNo: {
                $regex: `^${flightNo.trim()}$`,
                $options: "i"
            }
        });
        if (!flight) {
            return res.status(404).json({
                success: false,
                message: "Flight not found"
            });
        }
        res.status(200).json({
            success: true,
            flight
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

route.get("/api/buses/:busNo", async (req, res) => {
    try {
        const { busNo } = req.params;
        const bus = await Bus.findOne({
            busNo: busNo.trim()
        });
        if (!bus) {
            return res.status(404).json({
                success: false,
                message: "Bus not found"
            });
        }
        res.status(200).json({
            success: true,
            bus
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

route.get("/api/cabs/:cabId", async (req, res) => {
    try {
        const { cabId } = req.params;
        const cabDocs = await Cab.find().lean();
        let cab = null;
        for (const doc of cabDocs) {
            for (const key of Object.keys(doc)) {
                if (Array.isArray(doc[key])) {
                    const found = doc[key].find(item => item.cabId?.toLowerCase() === cabId.trim().toLowerCase());
                    if (found) {
                        cab = found;
                        break;
                    }
                }
            }
            if (cab) break;
        }
        if (!cab) {
            return res.status(404).json({
                success: false,
                message: "Cab not found"
            });
        }
        res.status(200).json({
            success: true,
            cab
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

route.get("/api/hotels/:hotelId", async (req, res) => {
    try {
        const { hotelId } = req.params;
        const hotelDocs = await Hotel.find().lean();
        let hotel = null;
        for (const doc of hotelDocs) {
            for (const key of Object.keys(doc)) {
                if (Array.isArray(doc[key])) {
                    const found = doc[key].find(item => item.hotelId?.toLowerCase() === hotelId.trim().toLowerCase());
                    if (found) {
                        hotel = found;
                        break;
                    }
                }
            }
            if (hotel) break;
        }
        if (!hotel) {
            return res.status(404).json({
                success: false,
                message: "Hotel not found"
            });
        }
        res.status(200).json({
            success: true,
            hotel
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

route.post("/api/bookings", authMiddleware, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "User is not authenticated"
            });
        }
        const userId = req.user.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User ID missing from authentication token"
            });
        }
        const { service, serviceId, passengers, selectedClass, selectedBusType, selectedRoom, farePerPassenger, totalFare } = req.body;
        const bookingMap = {
            train: "trains",
            flight: "flights",
            bus: "buses",
            cab: "cabs",
            hotel: "hotels"
        };
        const bookingField = bookingMap[service];
        if (!bookingField) {
            return res.status(400).json({
                success: false,
                message: "Invalid booking service"
            });
        }
        const bookingId = `BMJ-${Date.now()}`;
        const newBooking = {
            bookingId,
            serviceId,
            passengers: Number(passengers) || 1,
            selectedClass: selectedClass || "",
            selectedBusType: selectedBusType || "",
            selectedRoom: selectedRoom || "",
            farePerPassenger: Number(farePerPassenger) || 0,
            totalFare: Number(totalFare) || 0,
            status: "confirmed",
            bookedAt: new Date()
        };
        const user =
            await User.findByIdAndUpdate(
                userId,
                {
                    $push: { [`booking.${bookingField}`]: newBooking }
                },
                {
                    returnDocument: "after"
                }
            );
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        return res.status(201).json({
            success: true,
            message:
                "Booking confirmed successfully",
            booking: newBooking
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}
);
module.exports = route;