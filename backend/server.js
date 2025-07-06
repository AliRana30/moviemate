import "dotenv/config";
import express from "express";
import { serve } from "inngest/express";
import cors from "cors";
import connectDB from "./utils/db.js";
import { clerkMiddleware } from '@clerk/express'
import { functions, inngest } from "./inngest/index.js";

const app = express(); 

const corsOptions = {
    origin : process.env.FRONTEND_URL || "http://localhost:5173",
    methods : "POST , GET, PUT, DELETE",
}


app.use(express.json())
app.use(cors(corsOptions));
app.use(clerkMiddleware());
app.get('/',(req,res)=> res.send("Server is Live"))
app.use("/api/inngest", serve({ client: inngest, functions : [] }));

app.listen(process.env.PORT, () => {
  connectDB()
  console.log(`Server is running on port http://localhost:${process.env.PORT}`);
});