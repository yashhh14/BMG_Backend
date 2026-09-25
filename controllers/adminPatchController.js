const express = require("express");
const route = express.Router();
const adminMiddleware = require("../middleware/AdminMiddleware");

const {Train,Flight,Bus,Cab,Hotel} = require("../models/TravelServicesModel.js");
route.patch("/api/trains/:trainNo", adminMiddleware,async (req, res) => {
        try {
            const { trainNo } = req.params;
            const train = await Train.findOneAndUpdate(
                { trainNo },
                { $set: req.body },
                {
                    new: true,
                    runValidators: true
                }
            );
            if (!train) {
                return res.status(404).json({
                    success: false,
                    message: "Train not found"
                });
            }
            res.status(200).json({
                success: true,
                message: "Train updated successfully",
                train
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                message: err.message
            });
        }
    }
);
route.patch("/api/flights/:flightNo", adminMiddleware,async (req, res) => {
        try {
            const { flightNo } = req.params;
            const flight = await Flight.findOneAndUpdate(
                {
                    flightNo
                },
                {
                    $set: req.body
                },
                {
                    new: true,
                    runValidators: true
                }
            );
            if (!flight) {
                return res.status(404).json({
                    success: false,
                    message: "Flight not found"
                });
            }
            res.status(200).json({
                success: true,
                message: "Flight updated successfully",
                flight
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                message: err.message
            });
        }
    }
);
route.patch("/api/buses/:busNo",adminMiddleware,async (req, res) => {
        try {
            const { busNo } = req.params;
            const bus = await Bus.findOneAndUpdate(
                {
                    busNo
                },
                {
                    $set: req.body
                },
                {
                    new: true,
                    runValidators: true
                }
            );
            if (!bus) {
                return res.status(404).json({
                    success: false,
                    message: "Bus not found"
                });
            }
            res.status(200).json({
                success: true,
                message: "Bus updated successfully",
                bus
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                message: err.message
            });
        }
    }
);
route.patch("/api/hotels/:hotelId",adminMiddleware,async (req, res) => {
        try {
            const { hotelId } = req.params;
            const hotelDocs = await Hotel.collection.find({}).toArray();
            let found = null;
            for (const doc of hotelDocs) {
                for (const city of Object.keys(doc)) {
                    if (!Array.isArray(doc[city])) {
                        continue;
                    }
                    const index = doc[city].findIndex(hotel =>hotel.hotelId?.toLowerCase() ===hotelId.toLowerCase());
                    if (index !== -1) {
                        found = {
                            docId: doc._id,
                            city,
                            index,
                            hotel: doc[city][index]
                        };
                        break;
                    }
                }
                if (found) break;
            }
            if (!found) {
                return res.status(404).json({
                    success: false,
                    message: "Hotel not found"
                });
            }
            const allowedFields = ["name","city","area","stars","rating","rooms","amenities","checkIn","checkOut","images"];
            const updates = {};
            for (const field of allowedFields) {
                if (req.body[field] !== undefined) {
                    updates[`${found.city}.${found.index}.${field}`] = req.body[field];
                }
            }
            await Hotel.collection.updateOne(
                {
                    _id: found.docId
                },
                {
                    $set: updates
                }
            );
            const updatedHotel =await Hotel.collection.findOne({_id: found.docId});
            res.status(200).json({
                success: true,
                message: "Hotel updated successfully",
                hotel: updatedHotel[found.city][found.index]
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                message: err.message
            });
        }
    }
);

route.patch("/api/cabs/:cabId",adminMiddleware,async (req, res) => {
        try {
            const { cabId } = req.params;
            const cabDocs = await Cab.collection.find({}).toArray();
            let found = null;
            for (const doc of cabDocs) {
                for (const city of Object.keys(doc)) {
                    if (!Array.isArray(doc[city])) {
                        continue;
                    }
                    const index = doc[city].findIndex(cab =>cab.cabId?.toLowerCase() ===cabId.trim().toLowerCase());
                    if (index !== -1) {
                        found = {
                            docId: doc._id,
                            city,
                            index,
                            cab: doc[city][index]
                        };
                        break;
                    }
                }
                if (found) break;
            }
            if (!found) {
                return res.status(404).json({
                    success: false,
                    message: "Cab not found"
                });
            }
            const allowedFields = ["operator","cabType","carModel","city","driverName","rating","totalRides","baseFare","farePerKm","capacity","amenities","status","licensePlate","yearOfManufacture","fuelType"];
            const updates = {};
            for (const field of allowedFields) {
                if (req.body[field] !== undefined) {
                    updates[`${found.city}.${found.index}.${field}`] = req.body[field];
                }
            }
            if (Object.keys(updates).length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "No valid fields provided"
                });
            }
            await Cab.collection.updateOne(
                {
                    _id: found.docId
                },
                {
                    $set: updates
                }
            );
            const updatedDoc = await Cab.collection.findOne({
                _id: found.docId
            });
            return res.status(200).json({
                success: true,
                message: "Cab updated successfully",
                cab: updatedDoc[found.city][found.index]
            });
        } catch (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }
    }
);
module.exports=route