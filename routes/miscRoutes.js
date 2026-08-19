import { Router } from "express";
import { isPanAdded } from "../controllers/candidate/isPanAddedController.js";
import userAuth from "../middleware/authMiddleware.js";
const miscRouter = Router()


miscRouter.get("/is-pan-added", userAuth, isPanAdded)


export default miscRouter