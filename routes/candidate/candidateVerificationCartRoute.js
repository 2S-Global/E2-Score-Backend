import express from "express";
import multer from "multer";

import { addCandidateCart, listCandidateCart } from "../../controllers/candidate/candidateVerificationController.js";

import userAuth from "../../middleware/authMiddleware.js";

// Initialize router
const candidateVerificationCartRouter = express.Router();

// Setup multer with memory storage for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

candidateVerificationCartRouter.post( "/add_candidate_cart", userAuth, upload.none(), addCandidateCart);
candidateVerificationCartRouter.get( "/list_candidate_cart", userAuth, listCandidateCart);

export default candidateVerificationCartRouter;