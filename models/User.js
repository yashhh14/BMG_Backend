const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
    {
        bookingId: {
            type: String,
            required: true
        },
        serviceId: {
            type: String,
            required: true
        },
        journeyDate: {
            type: Date
        },
        passengers: {
            type: Number,
            default: 1
        },
        selectedClass: {
            type: String,
            default: ""
        },
        selectedBusType: {
            type: String,
            default: ""
        },
        selectedRoom: {
            type: String,
            default: ""
        },
        farePerPassenger: {
            type: Number,
            default: 0
        },
        totalFare: {
            type: Number,
            default: 0
        },
        status: {
            type: String,
            enum: [
                "pending",
                "confirmed",
                "cancelled",
                "completed"
            ],
            default: "confirmed"
        },
        bookedAt: {
            type: Date,
            default: Date.now
        }
    }
);


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        unique: true,
        sparse: true
    },
    password: {
        type: String
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    authProvider: {
        type: String,
        enum: ["local", "google"],
        default: "local"
    },
    booking: {
        trains: {
            type: [bookingSchema],
            default: []
        },
        flights: {
            type: [bookingSchema],
            default: []
        },
        buses: {
            type: [bookingSchema],
            default: []
        },
        cabs: {
            type: [bookingSchema],
            default: []
        },
        hotels: {
            type: [bookingSchema],
            default: []
        }
    }
});
const User = mongoose.model('user', userSchema);
module.exports = User;