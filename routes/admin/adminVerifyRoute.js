import express from "express";
import multer from "multer";

import {
  getAllVerifiedCandidateAdmin,
  getPaidUserVerificationCartByEmployer,
} from "../../controllers/admin/candidateVerifyController.js";

//Middleware
import userAuth from "../../middleware/authMiddleware.js";
import adminMiddleware from "../../middleware/adminMiddleware.js";
import Companymid from "../../middleware/companyMiddleware.js";

// Initialize router
const AdminVerifyRouter = express.Router();

// Setup multer with memory storage for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

AdminVerifyRouter.post('/getAllVerifiedCandidateAdmin', upload.none(), userAuth,Companymid, getAllVerifiedCandidateAdmin);

AdminVerifyRouter.post('/getPaidUserVerificationCartByEmployer', upload.none(), userAuth, Companymid, getPaidUserVerificationCartByEmployer);


export default AdminVerifyRouter;
