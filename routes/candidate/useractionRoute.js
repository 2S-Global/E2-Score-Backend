import express from "express";
import multer from "multer";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";

import {
  addProfilePicture,
  addResumeHeadline,
} from "../../controllers/candidate/useractionController.js";

import userAuth from "../../middleware/authMiddleware.js";

// Initialize router
const userRouter = express.Router();

// Setup multer with memory storage for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Update profile picture (Protected route, use POST for file upload)
userRouter.post(
  "/update-profile-picture",
  userAuth,
  upload.single("profile_picture"),
  addProfilePicture
);

userRouter.post("/resumeheadline", userAuth, upload.none(), addResumeHeadline);

export default userRouter;
