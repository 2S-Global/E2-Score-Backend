import express from "express";
import multer from "multer";

import {
  additskill,
  getitskill,
  edititskill,
  deleteitskill,
} from "../../controllers/candidate/useritskillController.js";
import userAuth from "../../middleware/authMiddleware.js";

// Initialize router ggg
const itskillRouter = express.Router();
// Setup multer with memory storage for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

itskillRouter.post("/additskill", userAuth, upload.none(), additskill);
itskillRouter.get("/itskill", userAuth, getitskill);
itskillRouter.put("/edititskill", userAuth, upload.none(), edititskill);
itskillRouter.delete("/deleteitskill", userAuth, deleteitskill);

export default itskillRouter;
