import express from "express";
import multer from "multer";

//import controllers

import { getAllJobList } from "../../controllers/candidate/CandidateJobListingController.js"

//import middleware
import userAuth from "../../middleware/authMiddleware.js";
import Candimid from "../../middleware/candidateMiddleware.js";

const CandidateJobListingRouter = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Routes

//get specific fees
// CandidateJobListingRouter.get(
//     "/test123",
//     userAuth,
//     Candimid,
//     asyncHandler(getSpecificFees)
// );

CandidateJobListingRouter.get(
    "/get_all_job_list",
    userAuth,
    Candimid,
    getAllJobList
);

export default CandidateJobListingRouter;
