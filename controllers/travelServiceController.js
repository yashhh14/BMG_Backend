const express = require("express");
const route = express.Router();
const { Train, Flight, Bus, Cab, Hotel } = require("../models/TravelServicesModel.js");
const { redisClient } = require("../DB/redis.js");
route.get("/api/trains", async (req, res) => {
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
        const cacheKey = `trains:${fromStation.toLowerCase()}:${toStation.toLowerCase()}`;

        const cachedTrains = await redisClient.get(cacheKey);

        if (cachedTrains) {
            const trains = JSON.parse(cachedTrains);

            console.log("Redis cache HIT:", cacheKey);

            return res.status(200).json({
                success: true,
                count: trains.length,
                trains
            });
        }

        console.log("Redis cache MISS:", cacheKey);
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
        await redisClient.setEx(
            cacheKey,
            300,
            JSON.stringify(trains)
        );
        console.log("Data stored in Redis:", cacheKey);
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
route.get("/api/flights", async (req, res) => {
    try {
        const { from, to } = req.query;
        if (!from || !to) {
            return res.status(400).json({
                success: false,
                message: "from and to are required"
            });
        }
        const cacheKey = `flights:${fromStation}:${toStation}`;

        const cachedFlights = await redisClient.get(cacheKey);

        if (cachedFlights) {
            const flights = JSON.parse(cachedFlights);

            console.log("Redis cache HIT:", cacheKey);

            return res.status(200).json({
                success: true,
                count: flights.length,
                flights
            });
        }

        console.log("Redis cache MISS:", cacheKey);
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
        await redisClient.setEx(
            cacheKey,
            300,
            JSON.stringify(flights)
        );
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


route.get("/api/buses", async (req, res) => {
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
        const cacheKey = `buses:${fromStation}:${toStation}`;

        const cachedBuses = await redisClient.get(cacheKey);

        if (cachedBuses) {
            const buses = JSON.parse(cachedBuses);

            console.log("Redis cache HIT:", cacheKey);

            return res.status(200).json({
                success: true,
                count: buses.length,
                buses
            });
        }

        console.log("Redis cache MISS:", cacheKey);
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
        await redisClient.setEx(
            cacheKey,
            300,
            JSON.stringify(buses)
        );
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

route.get("/api/cabs", async (req, res) => {
    try {
        const { city } = req.query;
        if (!city) {
            return res.status(400).json({
                success: false,
                message: "city is required"
            });
        }
        const cityName = city.trim().toLowerCase();
        const cacheKey = `cabs:${cityName}`;

        const cachedCabs = await redisClient.get(cacheKey);

        if (cachedCabs) {
            const result = JSON.parse(cachedCabs);

            console.log("Redis cache HIT:", cacheKey);

            return res.status(200).json({
                success: true,
                count: result.length,
                cabs: result
            });
        }

        console.log("Redis cache MISS:", cacheKey);
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
         await redisClient.setEx(
            cacheKey,
            300,
            JSON.stringify(result)
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

route.get("/api/hotels", async (req, res) => {
    try {
        const { city } = req.query;
        if (!city) {
            return res.status(400).json({
                success: false,
                message: "city is required"
            });
        }
        const cityName = city.trim().toLowerCase();
        const cacheKey = `hotels:${cityName}`;

        const cachedHotels = await redisClient.get(cacheKey);

        if (cachedHotels) {
            const result = JSON.parse(cachedHotels);

            console.log("Redis cache HIT:", cacheKey);

            return res.status(200).json({
                success: true,
                count: result.length,
                hotels: result
            });
        }

        console.log("Redis cache MISS:", cacheKey);

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
         await redisClient.setEx(
            cacheKey,
            300,
            JSON.stringify(result)
        );
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

