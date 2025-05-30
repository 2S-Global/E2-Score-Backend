import express from "express";
import multer from "multer";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";

import {
  addProfilePicture,
  addResumeHeadline,
  updateUserDetails,
  addProfileSummary,
  addKeySkills,
  submitUserEducation,
  updateUserEducation,
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
// Update user details
userRouter.post(
  "/update-user-details",
  userAuth,
  upload.none(),
  updateUserDetails
);

// Update user resume Headline
userRouter.post("/resumeheadline", userAuth, upload.none(), addResumeHeadline);
// Update user profile summary
userRouter.post("/profilesummary", userAuth, upload.none(), addProfileSummary);

// Update Key Skills
userRouter.post("/keyskills", userAuth, upload.none(), addKeySkills);

userRouter.post(
  "/usereducation",
  userAuth,
  upload.fields([
    { name: "transcript", maxCount: 1 },
    { name: "certificate", maxCount: 1 },
  ]),
  submitUserEducation
);

userRouter.put(
  "/usereducation",
  userAuth,
  upload.fields([
    { name: "transcript", maxCount: 1 },
    { name: "certificate", maxCount: 1 },
  ]),
  updateUserEducation
);
export default userRouter;
