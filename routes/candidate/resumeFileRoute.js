import express from "express";
import multer from "multer";

import {
  uploadPDF,
  getResumeDetails,
  deleteResume,
  uploadCoverLetter,
  getCoverLetterDetails,
} from "../../controllers/candidate/resumeFileController.js";

import userAuth from "../../middleware/authMiddleware.js";

// Initialize router
const resumeFileRouter = express.Router();

// Setup multer with memory storage for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

resumeFileRouter.post(
  "/upload-pdf",
  userAuth,
  upload.single("file"),
  uploadPDF,
);
resumeFileRouter.post(
  "/cover-letter",
  userAuth,
  upload.single("file"),
  uploadCoverLetter,
);

resumeFileRouter.get("/get_resume_details", userAuth, getResumeDetails);
resumeFileRouter.get("/cover-letter", userAuth, getCoverLetterDetails);

resumeFileRouter.delete(
  "/delete_resume_details",
  userAuth,
  upload.none(),
  deleteResume,
);

export default resumeFileRouter;
