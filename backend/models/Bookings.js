import mongoose, { mongo } from "mongoose";


const BookingSchema = new mongoose.Schema({

    user : {
        type: String,
        ref: "User",
        required: true
    },
    show : {
        type: String,
        ref: "Show",
        required: true
    },
    amount : {
        type: Number,
        required: true
    },
    bookedSeats : {
        type: Array,
        default: {}
    },
    isPaid : {
        type: Boolean,
        default: false
    },
    paymentLink : {
        type: String,
    },
},{timestamps : true})

const Bookings = mongoose.model("Bookings",BookingSchema)

export default Bookings;