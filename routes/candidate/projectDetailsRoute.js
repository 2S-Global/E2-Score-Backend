import express from "express";
import multer from "multer";

import {
  getProjectTag,
  addProjectDetails,
  getProjectDetails,
  editProjectDetails,
  deleteProjectDetails,
} from "../../controllers/candidate/projectDetailsController.js";

import userAuth from "../../middleware/authMiddleware.js";

// Initialize router
const projectDetailsRouter = express.Router();

// Setup multer with memory storage for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

projectDetailsRouter.get("/get_project_tag", getProjectTag);

projectDetailsRouter.post(
  "/add_project_details",
  userAuth,
  upload.none(),
  addProjectDetails
);

projectDetailsRouter.put(
  "/edit_project_details",
  userAuth,
  upload.none(),
  editProjectDetails
);

projectDetailsRouter.get("/get_project_details", userAuth, getProjectDetails);

projectDetailsRouter.delete(
  "/delete_project_details",
  userAuth,
  upload.none(),
  deleteProjectDetails
);

export default projectDetailsRouter;
