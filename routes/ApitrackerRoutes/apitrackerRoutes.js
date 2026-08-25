import { Router } from "express"
import userAuth from "../../middleware/authMiddleware.js";
import { getAllApiResponse } from "../../controllers/apiTracker/apiTracker.js";
import Adminmid from "../../middleware/adminMiddleware.js";

const apitrackerRoutes = Router();


apitrackerRoutes.get("/", userAuth, Adminmid, getAllApiResponse)

export default apitrackerRoutes