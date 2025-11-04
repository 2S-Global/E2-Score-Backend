import express from "express";
import multer from "multer";

//import controllers

import {getCandidateDetails} from "../../controllers/candidate/candidateDetailsController.js"

//import middleware
import userAuth from "../../middleware/authMiddleware.js";
import Companymid from "../../middleware/companyMiddleware.js";
import Adminmid from "../../middleware/adminMiddleware.js"

const CandidateDetailsRouter = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Routes

CandidateDetailsRouter.get(
  "/get_candidate_details",
  userAuth,
  Adminmid,
  getCandidateDetails
);

// CandidateDetailsRouter.post(
//   "/job_search_filters",
//   /*   userAuth,
//   Candimid, */
//   upload.none(),
//   jobsearchFilters
// );

export default CandidateDetailsRouter;