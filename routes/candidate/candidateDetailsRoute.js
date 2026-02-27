import express from "express";
import multer from "multer";

//import controllers

import { getCandidateDetails, getCandidateDashboardData, getAllCandidates } from "../../controllers/candidate/candidateDetailsController.js";
import { getCandidateDetailsV2 } from "../../controllers/candidate/candidatedetailsv2.js";
//import middleware
import userAuth from "../../middleware/authMiddleware.js";
import Companymid from "../../middleware/companyMiddleware.js";
import Adminmid from "../../middleware/adminMiddleware.js";

const CandidateDetailsRouter = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Routes

CandidateDetailsRouter.get("/get_candidate_details", getCandidateDetails);

// CandidateDetailsRouter.post(
//   "/job_search_filters",
//   /*   userAuth,
//   Candimid, */
//   upload.none(),
//   jobsearchFilters
// );

CandidateDetailsRouter.get("/get_candidate_details_v2", getCandidateDetailsV2);
CandidateDetailsRouter.get("/get_candidate_dashboard_data", userAuth, getCandidateDashboardData);
CandidateDetailsRouter.get("/get_all_candidates", userAuth, Companymid,  getAllCandidates);

export default CandidateDetailsRouter;