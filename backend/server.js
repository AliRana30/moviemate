import "dotenv/config";
import express from "express";
import { serve } from "inngest/express";
import cors from "cors";
import connectDB from "./utils/db.js";
import { clerkMiddleware } from '@clerk/express';

import { functions, inngest } from "./inngest/index.js";
import showRouter from "./routes/showRoutes.js";
import BookingRouter from "./routes/bookingRoutes.js";
import adminRouter from "./routes/adminRoutes.js";
import userRouter from "./routes/userRoutes.js";
import { stripeWebHook } from "./controllers/stripeWebHooks.js";

const app = express(); 

app.use('/api/stripe', express.raw({ type: 'application/json' }), stripeWebHook);

app.use(express.json());

const corsOptions = {
    origin: "https://moviemate-app-psi.vercel.app",
    methods: "POST, GET, PUT, DELETE",
};
app.use(cors(corsOptions));

// Clerk Auth
app.use(clerkMiddleware());

// Routes
app.get('/', (req, res) => res.send("Server is Live"));
app.use("api/inngest", serve({ client: inngest, functions }));
app.use("api/show", showRouter);
app.use("api/booking", BookingRouter);
app.use("api/admin", adminRouter);
app.use("api/user", userRouter);

// Start server
app.listen(process.env.PORT, () => {
    connectDB();
    console.log(`Server is running on http://localhost:${process.env.PORT}`);
});

