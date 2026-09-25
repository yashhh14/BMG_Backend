const express = require("express");
const route = express.Router();
const { Train, Flight, Bus, Cab, Hotel } = require("../models/TravelServicesModel.js");

route.get("/api/trains",   async (req, res) => {
    try {
        const { from, to } = req.query;
        if (!from || !to) {
            return res.status(400).json({
                success: false,
                message: "from and to are required"
            });
        }
        const fromStation = from.trim();
        const toStation = to.trim();
        const trains = await Train.find({
            $expr: {
                $let: {
                    vars: {
                        stations: {
                            $concatArrays: [
                                ["$source"],
                                {
                                    $map: {
                                        input: {
                                            $objectToArray: "$stops"
                                        },
                                        as: "stop",
                                        in: "$$stop.v.station"
                                    }
                                },
                                ["$destination"]
                            ]
                        }
                    },
                    in: {
                        $and: [
                            {
                                $ne: [
                                    {
                                        $indexOfArray: [
                                            {
                                                $map: {
                                                    input: "$$stations",
                                                    as: "station",
                                                    in: {
                                                        $toLower: "$$station"
                                                    }
                                                }
                                            },
                                            fromStation.toLowerCase()
                                        ]
                                    },
                                    -1
                                ]
                            },
                            {
                                $ne: [
                                    {
                                        $indexOfArray: [
                                            {
                                                $map: {
                                                    input: "$$stations",
                                                    as: "station",
                                                    in: {
                                                        $toLower: "$$station"
                                                    }
                                                }
                                            },
                                            toStation.toLowerCase()
                                        ]
                                    },
                                    -1
                                ]
                            },
                            {
                                $lt: [
                                    {
                                        $indexOfArray: [
                                            {
                                                $map: {
                                                    input: "$$stations",
                                                    as: "station",
                                                    in: {
                                                        $toLower: "$$station"
                                                    }
                                                }
                                            },
                                            fromStation.toLowerCase()
                                        ]
                                    },
                                    {
                                        $indexOfArray: [
                                            {
                                                $map: {
                                                    input: "$$stations",
                                                    as: "station",
                                                    in: {
                                                        $toLower: "$$station"
                                                    }
                                                }
                                            },
                                            toStation.toLowerCase()
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                }
            }
        });
        res.status(200).json({
            success: true,
            count: trains.length,
            trains
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});
route.get("/api/flights",   async (req, res) => {
    try {
        const { from, to } = req.query;
        if (!from || !to) {
            return res.status(400).json({
                success: false,
                message: "from and to are required"
            });
        }
        const flights = await Flight.find({
            source: {
                $regex: `^${from.trim()}$`,
                $options: "i"
            },
            destination: {
                $regex: `^${to.trim()}$`,
                $options: "i"
            }
        });
        res.status(200).json({
            success: true,
            count: flights.length,
            flights
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

route.post("/api/trains",   async (req, res) => {
    try {
        const {trainNo,trainName,source,destination,departure,arrival,duration,distance,classes,seatAvailability,stops,on_which_day} = req.body;
        const existingTrain = await Train.findOne({ trainNo });
        if (existingTrain) {
            return res.status(400).json({
                success: false,
                message: "Train number already exists"
            });
        }
        const train = await Train.create({trainNo,trainName,source,destination,departure,arrival,duration,distance,classes,seatAvailability,stops,on_which_day});
        res.status(201).json({
            success: true,
            message: "Train created successfully",
            train
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}
);

route.get("/api/buses",   async (req, res) => {
    try {
        const { from, to } = req.query;
        if (!from || !to) {
            return res.status(400).json({
                success: false,
                message: "from and to are required"
            });
        }
        const fromStation = from.trim().toLowerCase();
        const toStation = to.trim().toLowerCase();
        const buses = await Bus.find({
            $expr: {
                $let: {
                    vars: {
                        stations: {
                            $concatArrays: [
                                ["$source"],
                                {
                                    $map: {
                                        input: {
                                            $objectToArray: "$stops"
                                        },
                                        as: "stop",
                                        in: "$$stop.v.station"
                                    }
                                },
                                ["$destination"]
                            ]
                        }
                    },
                    in: {
                        $let: {
                            vars: {
                                lowerStations: {
                                    $map: {
                                        input: "$$stations",
                                        as: "station",
                                        in: {
                                            $toLower: "$$station"
                                        }
                                    }
                                }
                            },
                            in: {
                                $and: [
                                    {
                                        $ne: [
                                            {
                                                $indexOfArray: [
                                                    "$$lowerStations",
                                                    fromStation
                                                ]
                                            },
                                            -1
                                        ]
                                    },
                                    {
                                        $ne: [
                                            {
                                                $indexOfArray: [
                                                    "$$lowerStations",
                                                    toStation
                                                ]
                                            },
                                            -1
                                        ]
                                    },
                                    {
                                        $lt: [
                                            {
                                                $indexOfArray: [
                                                    "$$lowerStations",
                                                    fromStation
                                                ]
                                            },
                                            {
                                                $indexOfArray: [
                                                    "$$lowerStations",
                                                    toStation
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            }
                        }
                    }
                }
            }
        });
        res.status(200).json({
            success: true,
            count: buses.length,
            buses
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

route.get("/api/cabs",   async (req, res) => {
    try {
        const { city } = req.query;
        if (!city) {
            return res.status(400).json({
                success: false,
                message: "city is required"
            });
        }
        const cityName = city.trim().toLowerCase();
        const cabDocs = await Cab.find().lean();
        let result = [];
        for (const doc of cabDocs) {
            const cityKey = Object.keys(doc).find(
                key => key.toLowerCase() === cityName
            );
            if (cityKey && Array.isArray(doc[cityKey])) {
                result.push(...doc[cityKey]);
            }
        }
        result = result.filter(
            cab => cab.status?.toLowerCase() === "available"
        );
        res.status(200).json({
            success: true,
            count: result.length,
            cabs: result
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

route.get("/api/hotels",   async (req, res) => {
    try {
        const { city } = req.query;
        if (!city) {
            return res.status(400).json({
                success: false,
                message: "city is required"
            });
        }
        const cityName = city.trim().toLowerCase();
        const hotelDocs = await Hotel.find().lean();
        let result = [];
        for (const doc of hotelDocs) {
            const cityKey = Object.keys(doc).find(
                key => key.toLowerCase() === cityName
            );
            if (cityKey && Array.isArray(doc[cityKey])) {
                result.push(...doc[cityKey]);
            }
        }
        res.status(200).json({
            success: true,
            count: result.length,
            hotels: result
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

module.exports = route;

