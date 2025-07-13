import express from 'express';
import { requireAuth } from '@clerk/express';
const userRouter = express.Router();

import { userBookings, updateFavorite, getfavorites } from '../controllers/userController.js';


userRouter.get("/favorites", requireAuth(), getfavorites);
userRouter.post("/update-favorites", requireAuth(), updateFavorite);
userRouter.get("/bookings", requireAuth(), userBookings);

export default userRouter;