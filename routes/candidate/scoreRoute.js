import express from "express";

//import controllers
import { CibilScore } from "../../controllers/candidate/ScoreController.js";
//import middleware

import userAuth from "../../middleware/authMiddleware.js";
import Companymid from "../../middleware/companyMiddleware.js";
import Adminmid from "../../middleware/adminMiddleware.js";

const ScoreRouter = express.Router();

// Routes

ScoreRouter.post("/cibil-score", CibilScore);

export default ScoreRouter;
