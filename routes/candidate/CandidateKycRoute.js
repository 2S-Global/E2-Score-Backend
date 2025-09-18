import express from "express";
import multer from "multer";

//import controllers
import {
  addOrUpdateKYC,
  getKYC,
  CreateOrder,
  getFees,
  getSpecificFees,
  VerifyOrder,
} from "../../controllers/candidate/CandidateKycController.js";

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
// Add or Update KYC Information
CandidateKycRoute.post(
  "/kyc",
  userAuth,
  Candimid,
  upload.none(),
  asyncHandler(addOrUpdateKYC)
);
// Get KYC Information
CandidateKycRoute.get("/kyc", userAuth, Candimid, asyncHandler(getKYC));

//get fees
CandidateKycRoute.get("/fees", userAuth, Candimid, asyncHandler(getFees));

//get specific fees
CandidateKycRoute.get(
  "/fees/:documentType",
  userAuth,
  Candimid,
  asyncHandler(getSpecificFees)
);

//create a order
CandidateKycRoute.post(
  "/create-order",
  userAuth,
  Candimid,
  upload.none(),
  asyncHandler(CreateOrder)
);

//verify order
CandidateKycRoute.post(
  "/verify-order",
  userAuth,
  Candimid,
  upload.none(),
  asyncHandler(VerifyOrder)
);

export default CandidateKycRoute;
