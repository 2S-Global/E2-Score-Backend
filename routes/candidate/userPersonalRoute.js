import express from "express";
import multer from "multer";

import {
  test,
  submitPersonalDetails,
  getPersonalDetails,
} from "../../controllers/candidate/userPersonalController.js";
import { getPersonalDetailsWithName } from "../../controllers/candidate/backuppersonal.js";
import userAuth from "../../middleware/authMiddleware.js";
// Initialize router
const userPersonalRouter = express.Router();

// Setup multer with memory storage for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

userPersonalRouter.get("/test", test);

//Save Personal Details Data
userPersonalRouter.post(
  "/submit_personal_details",
  userAuth,
  upload.none(),
  submitPersonalDetails
);
// Get Personal Details Data
userPersonalRouter.get("/get_personal_details", userAuth, getPersonalDetails);

//Get Personal Details data with name
userPersonalRouter.get(
  "/get_personal_details_with_name",
  userAuth,
  getPersonalDetailsWithName
);

export default userPersonalRouter;
