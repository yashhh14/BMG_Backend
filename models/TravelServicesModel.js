const mongoose = require('mongoose');

const trainSchema = new mongoose.Schema(
    {
        trainNo: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        trainName: {
            type: String,
            required: true,
            trim: true
        },
        source: {
            type: String,
            required: true,
            trim: true
        },
        destination: {
            type: String,
            required: true,
            trim: true
        },
        departure: {
            type: String,
            required: true
        },
        arrival: {
            type: String,
            required: true
        },
        duration: {
            type: String,
            required: true
        },
        distance: {
            type: Number,
            required: true
        },
        classes: {
            SL: {
                type: Number
            },
            "3A": {
                type: Number
            },
            "2A": {
                type: Number
            },
            "1A": {
                type: Number
            }
        },
        seatAvailability: {
            SL: {
                type: Number,
                default: 0
            },
            "3A": {
                type: Number,
                default: 0
            },
            "2A": {
                type: Number,
                default: 0
            },
            "1A": {
                type: Number,
                default: 0
            }
        },
        stops: [
            {
                station: {
                    type: String,
                    required: true
                },
                arrival: {
                    type: String
                },
                departure: {
                    type: String
                },
                day: {
                    type: Number
                },
                distance: {
                    type: Number
                },
                halt: {
                    type: Number
                },
                platform: {
                    type: Number
                }
            }
        ],
        on_which_day: [
            {
                type: String
            }
        ]
    },
    {
        timestamps: true
    }
);

const flightSchema = new mongoose.Schema(
    {
        flightNo: {
            type: String,
            required: true,
            unique: true
        },
        airline: {
            type: String,
            required: true
        },
        source: {
            type: String,
            required: true
        },
        destination: {
            type: String,
            required: true
        },
        sourceCode: {
            type: String,
            required: true
        },
        destinationCode: {
            type: String,
            required: true
        },
        departure: {
            type: String,
            required: true
        },
        arrival: {
            type: String,
            required: true
        },
        duration: {
            type: String,
            required: true
        },
        classes: {
            type: Map,
            of: Number
        },
        seatAvailability: {
            type: Map,
            of: Number
        },
        aircraft: {
            type: String
        },
        baggage: {
            type: Map,
            of: String
        },
        on_which_day: {
            type: [String]
        }
    },
    {
        timestamps: true
    }
);
const busSchema = new mongoose.Schema(
    {
        busNo: {
            type: String,
            required: true,
            unique: true
        },
        busName: {
            type: String,
            required: true
        },
        operator: {
            type: String,
            required: true
        },
        busType: {
            type: String,
            required: true
        },
        source: {
            type: String,
            required: true
        },
        destination: {
            type: String,
            required: true
        },
        departure: {
            type: String,
            required: true
        },
        arrival: {
            type: String,
            required: true
        },
        duration: {
            type: String,
            required: true
        },
        distance: {
            type: Number
        },
        fare: {
            type: Map,
            of: Number
        },
        totalSeats: {
            type: Number
        },
        availableSeats: {
            type: Number
        },
        amenities: {
            type: [String]
        },
        rating: {
            type: Number
        },
        stops: {
            type: Map,
            of: new mongoose.Schema(
                {
                    station: String,
                    arrival: String,
                    departure: String,
                    distance: Number
                },
                { _id: false }
            )
        },
        on_which_day: {
            type: [String]
        }
    },
    {
        timestamps: true
    }
);



const cabSchema = new mongoose.Schema(
    {
        cabId: {
            type: String,
            required: true,
            unique: true
        },
        operator: {
            type: String,
            required: true
        },
        cabType: {
            type: String,
            required: true
        },
        carModel: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true,
            index: true
        },
        driverName: {
            type: String,
            required: true
        },
        rating: {
            type: Number,
            default: 0
        },
        totalRides: {
            type: Number,
            default: 0
        },
        baseFare: {
            type: Number,
            required: true
        },
        farePerKm: {
            type: Number,
            required: true
        },
        capacity: {
            type: Number,
            required: true
        },
        amenities: {
            ac: {
                type: Boolean,
                default: false
            },
            gps: {
                type: Boolean,
                default: false
            },
            childSeat: {
                type: Boolean,
                default: false
            },
            petFriendly: {
                type: Boolean,
                default: false
            }
        },
        status: {
            type: String,
            enum: ["available", "booked", "offline"],
            default: "available"
        },
        licensePlate: {
            type: String,
            required: true,
            unique: true
        },
        yearOfManufacture: {
            type: Number
        },
        fuelType: {
            type: String
        }
    },
    {
        timestamps: true
    }
);
const roomSchema = new mongoose.Schema(
    {
        price: {
            type: Number,
            required: true
        },
        capacity: {
            type: Number,
            required: true
        },
        available: {
            type: Number,
            default: 0
        }
    },
    { _id: false }
);

const hotelSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true,
            index: true
        },
        area: {
            type: String,
            required: true
        },
        stars: {
            type: Number,
            required: true
        },
        rating: {
            type: Number,
            default: 0
        },
        rooms: {
            type: Map,
            of: roomSchema
        },
        amenities: {
            type: [String]
        },
        checkIn: {
            type: String,
            required: true
        },
        checkOut: {
            type: String,
            required: true
        },
        images: {
            exterior: {
                type: [String]
            },
            room: {
                type: [String]
            },
            pool: {
                type: [String]
            },
            restaurant: {
                type: [String]
            },
            lobby: {
                type: [String]
            }
        }
    },
    {
        timestamps: true
    }
);
const Train = mongoose.model('train', trainSchema);
const Flight = mongoose.model("flight", flightSchema);
const Bus = mongoose.model("bus", busSchema);
const Cab = mongoose.model("cab", cabSchema);
const Hotel = mongoose.model("hotel", hotelSchema);
module.exports = { Train, Flight, Bus, Cab, Hotel };