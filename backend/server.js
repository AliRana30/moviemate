import "dotenv/config";
import express, { application } from "express";
import { serve } from "inngest/express";
import cors from "cors";
import connectDB from "./utils/db.js";
import { clerkMiddleware } from '@clerk/express';

import { functions, inngest } from "./inngest/index.js";
import showRouter from "./routes/showRoutes.js";
import BookingRouter from "./routes/bookingRoutes.js";
import adminRouter from "./routes/adminRoutes.js";
import userRouter from "./routes/userRoutes.js"
import { stripeWebHook } from "./controllers/stripeWebHooks.js";

const app = express(); 

const corsOptions = {
    origin : process.env.FRONTEND_URL || "http://localhost:5173",
    methods : "POST , GET, PUT, DELETE",
}


//Stripe Webhook Route
app.use('/api/stripe' , express.raw({type : 'application/json'}),stripeWebHook)


app.use(clerkMiddleware())
app.use(express.json())
app.use(cors(corsOptions));

app.get('/',(req,res)=> res.send("Server is Live"))
app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/show",showRouter)
app.use("/api/booking",BookingRouter)
app.use("/api/admin", adminRouter);
app.use("/api/user",userRouter)

app.listen(process.env.PORT, () => {
  connectDB()
  console.log(`Server is running on port http://localhost:${process.env.PORT}`);
});