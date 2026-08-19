import { Router } from "express";
import { isPanAdded } from "../controllers/candidate/isPanAddedController.js";

const miscRouter = Router()


miscRouter.get("/is-pan-added", isPanAdded)


export default miscRouter