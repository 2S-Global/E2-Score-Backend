import express from "express";
import multer from "multer";

import {
  addOrUpdateKYC,
  getKYC,
  getSpecificFees,
  CreateOrder,
  VerifyOrder,
} from "../../controllers/company/CompanyKycControllers.js";
// Middleware
import userAuth from "../../middleware/authMiddleware.js";
import Companymid from "../../middleware/companyMiddleware.js";

const CompanyKycRoute = express.Router(); // Setup multer with memory storage for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Async error wrapper
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

CompanyKycRoute.post(
  "/kyc",
  upload.none(),
  userAuth,
  Companymid,
  asyncHandler(addOrUpdateKYC)
);

CompanyKycRoute.get("/kyc", userAuth, Companymid, asyncHandler(getKYC));

CompanyKycRoute.get(
  "/fees/:documentType",
  userAuth,
  Companymid,
  asyncHandler(getSpecificFees)
);

CompanyKycRoute.post(
  "/create-order",
  upload.none(),
  userAuth,
  Companymid,
  asyncHandler(CreateOrder)
);

CompanyKycRoute.post(
  "/verify-order",
  upload.none(),
  userAuth,
  Companymid,
  asyncHandler(VerifyOrder)
);
export default CompanyKycRoute;
