import express from "express";
import multer from "multer";

import {
  uploadPDF } from "../../controllers/candidate/resumeFileController.js"


import userAuth from "../../middleware/authMiddleware.js";

// Initialize router
const resumeFileRouter = express.Router();

// Setup multer with memory storage for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// projectDetailsRouter.get("/get_project_tag" , getProjectTag);

// resumeFileRouter.post("/add_resume", userAuth, upload.none(), addResume);

resumeFileRouter.post("/upload-pdf", userAuth, upload.single("file"), uploadPDF);

// projectDetailsRouter.get("/get_project_details", userAuth, getProjectDetails);

// projectDetailsRouter.put("/edit_project_details", userAuth, upload.none(), editProjectDetails);

// projectDetailsRouter.delete("/delete_project_details", userAuth, upload.none(), deleteProjectDetails);


export default resumeFileRouter;