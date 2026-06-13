import express from "express";
import {
  upsertReview,
  getReviewByRecruiter,
} from "../../controllers/institute/instituteFeedbackController.js";
import userAuth from "../../middleware/authMiddleware.js";
import Institutemid from "../../middleware/InstituteMiddleware.js";

const router = express.Router();

// Create or Update Review
router.post("/review", userAuth, Institutemid, upsertReview);

// Get Review By Recruiter
router.get(
  "/review/:recruiter_id",
  userAuth,
  Institutemid,
  getReviewByRecruiter,
);

export default router;
