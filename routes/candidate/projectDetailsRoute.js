import express from "express";
import multer from "multer";

// import {
//     getProjectTag
// } from "../../controllers/candidate/useritskillController.js";

import {
    getProjectTag
} from "../../controllers/candidate/projectDetailsController.js";


import userAuth from "../../middleware/authMiddleware.js";

// Initialize router
const projectDetailsRouter = express.Router();

// Setup multer with memory storage for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// itskillRouter.post("/additskill", userAuth, upload.none(), additskill);

projectDetailsRouter.get("/get_project_tag" , getProjectTag);

// itskillRouter.put("/edititskill", userAuth, upload.none(), edititskill);
// itskillRouter.delete("/deleteitskill", userAuth, deleteitskill);

export default projectDetailsRouter;
