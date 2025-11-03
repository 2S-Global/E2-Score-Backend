import express from "express";
import multer from "multer";

import { getResume , AdmingetResume } from "../../controllers/candidate/resumeMakingController.js";

import userAuth from "../../middleware/authMiddleware.js";
import Adminmid from "../../middleware/adminMiddleware.js";

// Initialize router
const resumeMakingRouter = express.Router();

// Setup multer with memory storage for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

resumeMakingRouter.get("/get_resume", userAuth, getResume);

resumeMakingRouter.get("/get_resume_admin", userAuth, Adminmid, AdmingetResume);

export default resumeMakingRouter;
