import express from "express";
import {showController , addShow , getAllShows, getSingleShow} from "../controllers/showController.js";
import { protectAdmin } from "../middleware/auth.js";

const showRouter = express.Router();

showRouter.get('/now-playing',protectAdmin,showController)
showRouter.post('/add',protectAdmin,addShow);
showRouter.get('/all',getAllShows)
showRouter.get('/:id',getSingleShow)




export default showRouter