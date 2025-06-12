import express from "express";
import multer from "multer";

import {
  addOnlineProfile,
  getOnlineProfile,
  editOnlineProfile,
  deleteOnlineProfile,
  addWorkSample,
  getWorkSamples,
  editWorkSample,
  deleteWorkSample,
  addResearchPublication,
  getResearchPublication,
  updateResearchPublication,
  deleteResearchPublication,
  addpresentaion,
  updatepresentaion,
  deletepresentaion,
  getpresetation,
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

//--------------------------Work Samples----------------------------------------

userAccomplishmentRouter.post(
  "/add_work_samples",
  userAuth,
  upload.none(),
  addWorkSample
);

userAccomplishmentRouter.get("/get_work_samples", userAuth, getWorkSamples);

userAccomplishmentRouter.put(
  "/edit_work_samples",
  userAuth,
  upload.none(),
  editWorkSample
);

userAccomplishmentRouter.delete(
  "/delete_work_sample",
  userAuth,
  upload.none(),
  deleteWorkSample
);

//    ------------------Research Publication----------------------

userAccomplishmentRouter.post(
  "/add_research_publication",
  userAuth,
  upload.none(),
  addResearchPublication
);

userAccomplishmentRouter.get(
  "/get_research_publication",
  userAuth,
  getResearchPublication
);

userAccomplishmentRouter.put(
  "/update_research_publication",
  userAuth,
  upload.none(),
  updateResearchPublication
);

userAccomplishmentRouter.delete(
  "/delete_research_publication",
  userAuth,
  upload.none(),
  deleteResearchPublication
);

//    --------------------Presentaion-------------------------
userAccomplishmentRouter.post(
  "/add_presentaion",
  userAuth,
  upload.none(),
  addpresentaion
);

userAccomplishmentRouter.put(
  "/update_presentaion",
  userAuth,
  upload.none(),
  updatepresentaion
);

userAccomplishmentRouter.delete(
  "/delete_presentaion",
  userAuth,
  upload.none(),
  deletepresentaion
);

userAccomplishmentRouter.get("/get_presentaion", userAuth, getpresetation);

export default userAccomplishmentRouter;
