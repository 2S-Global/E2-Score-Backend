import express from "express";
import multer from "multer";

import { uploadPDF, getResumeDetails, deleteResume } from "../../controllers/candidate/resumeFileController.js";


import userAuth from "../../middleware/authMiddleware.js";

// Initialize router
const resumeFileRouter = express.Router();

// Setup multer with memory storage for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

resumeFileRouter.post("/upload-pdf", userAuth, upload.single("file"), uploadPDF);

resumeFileRouter.get("/get_resume_details", userAuth, getResumeDetails);

resumeFileRouter.delete("/delete_resume_details", userAuth, upload.none(), deleteResume);


export default resumeFileRouter;