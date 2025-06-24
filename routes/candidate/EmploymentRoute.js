import express from "express";
import multer from "multer";

import { getMatchingCompany } from "../../controllers/candidate/EmploymentController.js";

import userAuth from "../../middleware/authMiddleware.js";

// Initialize router
const employmentRouter = express.Router();
// Setup multer with memory storage for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

employmentRouter.get("/matching_company", getMatchingCompany);

export default employmentRouter;
