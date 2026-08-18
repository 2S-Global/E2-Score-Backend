import express from "express";

//import controllers
import {
    createPayment,
    verifyPaymentAndGetScore,
    CibilScore,
    ExperianScore,
    getMyScores
} from "../../controllers/candidate/ScoreController.js";

//import middleware
import userAuth from "../../middleware/authMiddleware.js";

const ScoreRouter = express.Router();

// Routes

ScoreRouter.post("/create-payment", createPayment);
ScoreRouter.post("/payment/create", createPayment);


ScoreRouter.post("/credit-report/verify", verifyPaymentAndGetScore);
ScoreRouter.get('/my-score/:type', getMyScores)

ScoreRouter.post("/cibil-score", CibilScore);
ScoreRouter.post("/experian-score", ExperianScore);

export default ScoreRouter;
