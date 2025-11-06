import express from "express";
import multer from "multer";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";

import { addCandidateBookmark, getCandidateBookmarkStatus } from "../../controllers/admin/candidateBookmarkController.js";

//Middleware
import userAuth from "../../middleware/authMiddleware.js";
import adminMiddleware from "../../middleware/adminMiddleware.js";

// Initialize dotenv to load environment variables
dotenv.config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Initialize router
const candidateBookmarkRouter = express.Router();

// Setup multer with memory storage for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

candidateBookmarkRouter.post(
    "/add_candidate_bookmark",
    upload.none(),
    userAuth,
    adminMiddleware,
    addCandidateBookmark
);

candidateBookmarkRouter.get(
    "/get_candidate_bookmark",
    upload.none(),
    userAuth,
    adminMiddleware,
    getCandidateBookmarkStatus
);

export default candidateBookmarkRouter;