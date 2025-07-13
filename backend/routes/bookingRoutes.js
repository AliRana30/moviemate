import express from "express";
import { createBooking, occupiedSeatsData } from "../controllers/BookingController.js";
import { requireAuth } from "@clerk/express";

const BookingRouter = express.Router()

BookingRouter.post("/create",requireAuth(),createBooking);
BookingRouter.get("/seats/:showId",occupiedSeatsData);

export default BookingRouter;