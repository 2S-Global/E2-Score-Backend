import express from "express";
import multer from "multer";

//import controllers
import { addOrUpdateKYC } from "../../controllers/candidate/CandidateKycController.js";

//import middleware
import userAuth from "../../middleware/authMiddleware.js";
import Candimid from "../../middleware/candidateMiddleware.js";

const CandidateKycRoute = express.Router(); // Setup multer with memory storage for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Async error wrapper
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Routes
CandidateKycRoute.post(
  "/kyc",
  userAuth,
  Candimid,
  upload.none(),
  asyncHandler(addOrUpdateKYC)
);

export default CandidateKycRoute;
