import express from "express";
import { getAllBookings, getDashboardData, fetchisAdmin, getAllShows } from "../controllers/adminController.js";
import { protectAdmin } from "../middleware/auth.js";
import { requireAuth } from "@clerk/express";

const adminRouter = express.Router();

adminRouter.get("/is-admin", requireAuth(), fetchisAdmin);

adminRouter.get("/dashboard", protectAdmin, getDashboardData);
adminRouter.get("/shows",protectAdmin, getAllShows);
adminRouter.get("/bookings", protectAdmin, getAllBookings);

export default adminRouter;