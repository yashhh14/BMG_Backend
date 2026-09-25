const express = require("express");
const route = express.Router();
const adminMiddleware = require("../middleware/AdminMiddleware");
const {Train,Flight,Bus,Cab,Hotel} = require("../models/TravelServicesModel.js");
route.delete("/api/trains/:trainNo", adminMiddleware,async (req, res) => {
        try {
            const { trainNo } = req.params;
            const train = await Train.findOneAndDelete({trainNo});
            if (!train) {
                return res.status(404).json({
                    success: false,
                    message: "Train not found"
                });
            }
            return res.status(200).json({
                success: true,
                message: "Train deleted successfully",
                train
            });
        } catch (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }
    }
);


route.delete("/api/flights/:flightNo", adminMiddleware,async (req, res) => {
        try {
            const { flightNo } = req.params;
            const flight = await Flight.findOneAndDelete({flightNo});
            if (!flight) {
                return res.status(404).json({
                    success: false,
                    message: "Flight not found"
                });
            }
            return res.status(200).json({
                success: true,
                message: "Flight deleted successfully",
                flight
            });
        } catch (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }
    }
);

route.delete("/api/buses/:busNo", adminMiddleware,async (req, res) => {
        try {
            const { busNo } = req.params;
            const bus = await Bus.findOneAndDelete({busNo});
            if (!bus) {
                return res.status(404).json({
                    success: false,
                    message: "Bus not found"
                });
            }
            return res.status(200).json({
                success: true,
                message: "Bus deleted successfully",
                bus
            });
        } catch (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }
    }
);

route.delete("/api/cabs/:cabId", adminMiddleware,async (req, res) => {
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
            await Cab.collection.updateOne(
                {
                    _id: found.docId
                },
                {
                    $pull: {
                        [found.city]: {
                            cabId: found.cab.cabId
                        }
                    }
                }
            );
            return res.status(200).json({
                success: true,
                message: "Cab deleted successfully",
                cab: found.cab
            });
        } catch (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }
    }
);

route.delete("/api/hotels/:hotelId", adminMiddleware,async (req, res) => {
        try {
            const { hotelId } = req.params;
            const hotelDocs = await Hotel.collection.find({}).toArray();
            let found = null;
            for (const doc of hotelDocs) {
                for (const city of Object.keys(doc)) {
                    if (!Array.isArray(doc[city])) {
                        continue;
                    }
                    const index = doc[city].findIndex(hotel =>hotel.hotelId?.toLowerCase() ===hotelId.trim().toLowerCase());
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
            await Hotel.collection.updateOne(
                {
                    _id: found.docId
                },
                {
                    $pull: {
                        [found.city]: {
                            hotelId: found.hotel.hotelId
                        }
                    }
                }
            );
            return res.status(200).json({
                success: true,
                message: "Hotel deleted successfully",
                hotel: found.hotel
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