import express from "express";
import multer from "multer";

import {
  additskill,
  getitskill,
  edititskill,
  deleteitskill,
  addOtherSkill,
  editotherskill,
  getotherskill,
  deleteotherskill
} from "../../controllers/candidate/useritskillController.js";
import userAuth from "../../middleware/authMiddleware.js";

// Initialize router
const itskillRouter = express.Router();
// Setup multer with memory storage for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

itskillRouter.post("/additskill", userAuth, upload.none(), additskill);
itskillRouter.get("/itskill", userAuth, getitskill);
itskillRouter.put("/edititskill", userAuth, upload.none(), edititskill);
itskillRouter.delete("/deleteitskill", userAuth, deleteitskill);

// Other Skill Route
itskillRouter.post("/addotherskill", userAuth, upload.none(), addOtherSkill);
itskillRouter.get("/getotherskill", userAuth, getotherskill);
itskillRouter.put("/editotherskill", userAuth, upload.none(), editotherskill);
itskillRouter.post("/deleteotherskill", userAuth, upload.none(), deleteotherskill);

export default itskillRouter;