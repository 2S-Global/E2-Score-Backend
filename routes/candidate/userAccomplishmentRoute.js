import express from "express";
import multer from "multer";

import {
  addOnlineProfile,
  getOnlineProfile,
  editOnlineProfile,
  deleteOnlineProfile,
} from "../../controllers/candidate/userAccomplishmentController.js";

import userAuth from "../../middleware/authMiddleware.js";

// Initialize router
const userAccomplishmentRouter = express.Router();

// Setup multer with memory storage for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

userAccomplishmentRouter.post(
  "/add_online_profile",
  userAuth,
  upload.none(),
  addOnlineProfile
);

userAccomplishmentRouter.get("/get_online_profile", userAuth, getOnlineProfile);
userAccomplishmentRouter.put(
  "/edit_online_profile",
  userAuth,
  upload.none(),
  editOnlineProfile
);

userAccomplishmentRouter.delete(
  "/delete_online_profile",
  userAuth,
  upload.none(),
  deleteOnlineProfile
);

export default userAccomplishmentRouter;
