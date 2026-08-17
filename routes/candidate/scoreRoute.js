import express from "express";

//import controllers
import { CibilScore, ExperianScore } from "../../controllers/candidate/ScoreController.js";
//import middleware

import userAuth from "../../middleware/authMiddleware.js";
import Companymid from "../../middleware/companyMiddleware.js";
import Adminmid from "../../middleware/adminMiddleware.js";

const ScoreRouter = express.Router();

// Routes

ScoreRouter.post("/cibil-score", CibilScore);
ScoreRouter.post("/experian-score", ExperianScore);

export default ScoreRouter;
