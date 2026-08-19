import express from "express";

//import controllers
import {
    createPayment,
    verifyPaymentAndGetScore,
    getMyScores
} from "../../controllers/candidate/ScoreController.js";

//import middleware
import userAuth from "../../middleware/authMiddleware.js";

const ScoreRouter = express.Router();

// Routes

ScoreRouter.post("/create-payment", userAuth, createPayment);
ScoreRouter.post("/payment/create", userAuth, createPayment);


ScoreRouter.post("/credit-report/verify", userAuth, verifyPaymentAndGetScore);
ScoreRouter.get('/my-score/:type', userAuth, getMyScores);

export default ScoreRouter;
