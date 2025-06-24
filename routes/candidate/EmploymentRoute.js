import express from "express";
import multer from "multer";

import { getMatchingCompany, getRandomCompany } from "../../controllers/candidate/EmploymentController.js";

import userAuth from "../../middleware/authMiddleware.js";

// Initialize router
const employmentRouter = express.Router();
// Setup multer with memory storage for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

employmentRouter.get("/matching_company", getMatchingCompany);
employmentRouter.get("/random_company", getRandomCompany);

export default employmentRouter;
