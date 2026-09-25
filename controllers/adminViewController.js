const express = require("express");
const route = express.Router();
const adminMiddleware = require("../middleware/AdminMiddleware.js");
const { Train, Flight, Bus, Cab, Hotel } = require("../models/TravelServicesModel.js");

route.get("/api/admin/trains/count", adminMiddleware, async (req, res) => {
    try {
        const total = await Train.countDocuments();
        return res.status(200).json({
            success: true,
            total
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
}
);

route.get("/api/admin/trains", adminMiddleware, async (req, res) => {
    try {
        const trainNo = req.query.trainNo?.trim() || "";
        const trainName = req.query.trainName?.trim() || "";
        const source = req.query.source?.trim() || "";
        const destination = req.query.destination?.trim() || "";
        const page = Math.max(
            Number(req.query.page) || 1,
            1
        );
        const limit = Math.min(
            Number(req.query.limit) || 25,
            100
        );
        const skip = (page - 1) * limit;
        if (!trainNo && !trainName && !source && !destination) {
            return res.status(200).json({
                success: true,
                trains: [],
                total: 0,
                page: 1,
                limit,
                totalPages: 0
            });
        }
        const filter = {};
        if (trainNo) {
            filter.trainNo = {
                $regex: trainNo,
                $options: "i"
            };
        }
        if (trainName) {
            filter.trainName = {
                $regex: trainName,
                $options: "i"
            };
        }
        if (source) {
            filter.source = {
                $regex: source,
                $options: "i"
            };
        }
        if (destination) {
            filter.destination = {
                $regex: destination,
                $options: "i"
            };
        }
        const [trains, total] = await Promise.all([
            Train.find(
                filter,
                {
                    trainNo: 1,
                    trainName: 1,
                    source: 1,
                    destination: 1,
                    departure: 1,
                    arrival: 1,
                    duration: 1
                }
            ).sort({ trainNo: 1 }).skip(skip).limit(limit).lean(),
            Train.countDocuments(
                filter
            )
        ]);
        return res.status(200).json({
            success: true,
            trains,
            total,
            page,
            limit,
            totalPages:
                Math.ceil(
                    total / limit
                )
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
}
);
route.post("/api/admin/trains", adminMiddleware, async (req, res) => {
    try {
        const { trainNo, trainName, source, destination, departure, arrival, duration, distance, classes, seatAvailability, stops, on_which_day } = req.body;
        if (
            !trainNo ||
            !trainName ||
            !source ||
            !destination
        ) {
            return res.status(400).json({
                success: false,
                message: "Train number, train name, source and destination are required"
            });
        }
        const cleanTrainNo = String(trainNo).trim();
        const cleanTrainName = String(trainName).trim();
        const cleanSource = String(source).trim();
        const cleanDestination = String(destination).trim();
        const existingTrain = await Train.findOne({ trainNo: cleanTrainNo });
        if (existingTrain) {
            return res.status(409).json({
                success: false,
                message: `Train ${cleanTrainNo} already exists`
            });
        }
        const finalStops = stops || {};
        if (
            typeof finalStops !== "object" || Array.isArray(finalStops)
        ) {
            return res.status(400).json({
                success: false,
                message: "Stops must be an object"
            });
        }
        for (const key of Object.keys(finalStops)) {
            const stop = finalStops[key];
            if (
                !stop ||
                !stop.station ||
                !String(stop.station).trim()
            ) {
                return res.status(400).json({
                    success: false,
                    message: `Station name is required for stop ${Number(key) + 1}`
                });
            }
        }
        const train = await Train.create({
            trainNo: cleanTrainNo,
            trainName: cleanTrainName,
            source: cleanSource,
            destination: cleanDestination,
            departure: departure ? String(departure).trim() : "",
            arrival: arrival ? String(arrival).trim() : "",
            duration: duration ? String(duration).trim() : "",
            distance: Number(distance || 0),
            classes: classes && typeof classes === "object" ? classes : {},
            seatAvailability: seatAvailability && typeof seatAvailability === "object" ? seatAvailability : {},
            stops: finalStops,
            on_which_day: Array.isArray(on_which_day) ? on_which_day : []
        });
        return res.status(201).json({
            success: true,
            message: "Train added successfully",
            train
        });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Train number already exists"
            });
        }
        if (err.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
}
);
route.get("/api/admin/trains/:trainNo", adminMiddleware, async (req, res) => {
    try {
        const train = await Train.findOne({ trainNo: req.params.trainNo }).lean();
        if (!train) {
            return res.status(404).json({
                success: false,
                message: "Train not found"
            });
        }
        return res.status(200).json({
            success: true,
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
route.get("/api/admin/flights", adminMiddleware, async (req, res) => {
    try {
        const flights = await Flight.find({}).lean();
        return res.status(200).json({
            success: true,
            count: flights.length,
            flights
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
}
);
route.post("/api/admin/flights", adminMiddleware, async (req, res) => {
    try {
        const { flightNo, airline, source, destination, sourceCode, destinationCode, departure, arrival, duration, aircraft, baggage, on_which_day, seatAvailability, classes } = req.body;
        if (
            !flightNo ||
            !airline ||
            !source ||
            !destination
        ) {
            return res.status(400).json({
                success: false,
                message: "Flight number, airline, source and destination are required"
            });
        }
        const existingFlight = await Flight.findOne({ flightNo: flightNo.trim() });
        if (existingFlight) {
            return res.status(409).json({
                success: false,
                message: "Flight already exists"
            });
        }
        const newFlight = await Flight.create({
            flightNo: flightNo.trim(),
            airline: airline.trim(),
            source: source.trim(),
            destination: destination.trim(),
            sourceCode: sourceCode?.trim() || "",
            destinationCode: destinationCode?.trim() || "",
            departure: departure || "",
            arrival: arrival || "",
            duration: duration || "",
            aircraft: aircraft || "",
            baggage: baggage || "",
            on_which_day: Array.isArray(on_which_day) ? on_which_day : [],
            seatAvailability: seatAvailability && typeof seatAvailability === "object" ? seatAvailability : {},
            classes: classes && typeof classes === "object" ? classes : {}
        });
        return res.status(201).json({
            success: true,
            message: "Flight added successfully",
            flight: newFlight
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Flight number already exists"
            });
        }
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}
);
route.get("/api/admin/cabs", adminMiddleware, async (req, res) => {
    try {
        const documents = await Cab.collection.find({}).toArray();
        const cabs = [];
        for (const doc of documents) {
            for (const city of Object.keys(doc)) {
                if (!Array.isArray(doc[city])
                ) {
                    continue;
                }
                cabs.push(...doc[city]);
            }
        }
        return res.status(200).json({
            success: true,
            count: cabs.length,
            cabs
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
}
);
route.post("/api/admin/cabs", adminMiddleware, async (req, res) => {
    try {
        const { cabId, operator, cabType, carModel, city, driverName, rating, baseFare, farePerKm, capacity, status } = req.body;
        if (
            !cabId ||
            !operator ||
            !cabType ||
            !carModel ||
            !city
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Cab ID, operator, cab type, car model and city are required"
            });
        }
        const cleanCity = city.trim();
        const allCabDocuments = await Cab.collection.find({}).toArray();
        let duplicate = false;
        for (const document of allCabDocuments) {
            for (const key of Object.keys(document)) {
                if (key === "_id") continue;
                const cabArray = document[key];
                if (!Array.isArray(cabArray)) continue;
                const found = cabArray.some(cab => String(cab.cabId).toLowerCase() === cabId.trim().toLowerCase());
                if (found) {
                    duplicate = true;
                    break;
                }
            }
            if (duplicate) break;
        }
        if (duplicate) {
            return res.status(409).json({
                success: false,
                message: "Cab ID already exists"
            });
        }
        const newCab = {
            cabId: cabId.trim(),
            operator: operator.trim(),
            cabType: cabType.trim(),
            carModel: carModel.trim(),
            city: cleanCity,
            driverName: driverName || "",
            rating: Number(rating) || 0,
            baseFare: Number(baseFare) || 0,
            farePerKm: Number(farePerKm) || 0,
            capacity: Number(capacity) || 4,
            status: status || "available"
        };
        const cityDocument = await Cab.collection.findOne({ [cleanCity]: { $exists: true } });
        if (cityDocument) {
            await Cab.collection.updateOne(
                { _id: cityDocument._id },
                {
                    $push: {
                        [cleanCity]: newCab
                    }
                }
            );
        } else {
            await Cab.collection.insertOne({ [cleanCity]: [newCab] });
        }
        return res.status(201).json({
            success: true,
            message: "Cab added successfully",
            cab: newCab
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}
);
route.get("/api/admin/hotels", adminMiddleware, async (req, res) => {
    try {
        const documents = await Hotel.collection.find({}).toArray();
        const hotels = [];
        for (const doc of documents) {
            for (const city of Object.keys(doc)) {
                if (
                    !Array.isArray(
                        doc[city]
                    )
                ) {
                    continue;
                }
                hotels.push(...doc[city]);
            }
        }
        return res.status(200).json({
            success: true,
            count: hotels.length,
            hotels
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
}
);

route.post("/api/admin/hotels", adminMiddleware, async (req, res) => {
    try {
        const { hotelId, name, city, area, stars, rating, rooms, checkIn, checkOut } = req.body;
        if (
            !hotelId ||
            !name ||
            !city
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Hotel ID, hotel name and city are required"
            });
        }
        const cleanCity = city.trim();
        const allHotelDocuments = await Hotel.collection.find({}).toArray();
        let duplicate = false;
        for (const document of allHotelDocuments) {
            for (const key of Object.keys(document)) {
                if (key === "_id") continue;
                const hotelArray = document[key];
                if (!Array.isArray(hotelArray)) continue;
                const found = hotelArray.some(hotel => String(hotel.hotelId).toLowerCase() === hotelId.trim().toLowerCase());
                if (found) {
                    duplicate = true;
                    break;
                }
            }
            if (duplicate) break;
        }
        if (duplicate) {
            return res.status(409).json({
                success: false,
                message: "Hotel ID already exists"
            });
        }
        const newHotel = {
            hotelId: hotelId.trim(),
            name: name.trim(),
            city: cleanCity,
            area: area || "",
            stars: Number(stars) || 0,
            rating: Number(rating) || 0,
            rooms: rooms && typeof rooms === "object" ? rooms : {},
            checkIn: checkIn || "",
            checkOut: checkOut || ""
        };
        const cityDocument = await Hotel.collection.findOne({ [cleanCity]: { $exists: true } });
        if (cityDocument) {
            await Hotel.collection.updateOne(
                { _id: cityDocument._id },
                {
                    $push: {
                        [cleanCity]: newHotel
                    }
                }
            );
        } else {
            await Hotel.collection.insertOne({ [cleanCity]: [newHotel] });
        }
        return res.status(201).json({
            success: true,
            message: "Hotel added successfully",
            hotel: newHotel
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}
);
route.get("/api/admin/buses", adminMiddleware, async (req, res) => {
    try {
        const buses = await Bus.find({}).lean();
        return res.status(200).json({
            success: true,
            count: buses.length,
            buses
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
}
);

route.post("/api/admin/buses", adminMiddleware, async (req, res) => {
    try {
        const { busNo, busName, operator, busType, source, destination, departure, arrival, duration, distance, fare, totalSeats, availableSeats, amenities, rating, stops, on_which_day } = req.body;
        if (
            !busNo ||
            !busName ||
            !operator ||
            !busType ||
            !source ||
            !destination
        ) {
            return res.status(400).json({
                success: false,
                message: "Bus number, name, operator, type, source and destination are required"
            });
        }
        const existingBus = await Bus.findOne({ busNo: busNo.trim() });
        if (existingBus) {
            return res.status(409).json({
                success: false,
                message: "Bus already exists"
            });
        }
        const newBus = await Bus.create({
            busNo: busNo.trim(),
            busName: busName.trim(),
            operator: operator.trim(),
            busType: busType.trim(),
            source: source.trim(),
            destination: destination.trim(),
            departure: departure || "",
            arrival: arrival || "",
            duration: duration || "",
            distance: Number(distance) || 0,
            fare: fare && typeof fare === "object" ? fare : {},
            totalSeats: Number(totalSeats) || 0,
            availableSeats: Number(availableSeats) || 0,
            amenities: Array.isArray(amenities) ? amenities : [],
            rating: Number(rating) || 0,
            stops:
                stops &&
                    typeof stops === "object"
                    ? stops
                    : {},
            on_which_day: Array.isArray(on_which_day) ? on_which_day : []
        });
        return res.status(201).json({
            success: true,
            message: "Bus added successfully",
            bus: newBus
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Bus number already exists"
            });
        }
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}
);
module.exports = route;