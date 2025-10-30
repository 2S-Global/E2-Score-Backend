import exprss from "express";

//controller
import { AllJobSpecialization, AllJobTypes, AllJobBenefits, AllJobCareerLevels, AllJobQualifications, AllJobExperienceLevels, AllJobModes, AllCompanyBranches, AddJobPostingDetails, GetJobPostingDetails, EditJobPostingDetails, ConfirmJobPostingDetails, getAllJobListing, deleteJobPosting, getJobPreviewDetails } from "../../controllers/company/JobPostingDataController.js";

//middleware
import userAuth from "../../middleware/authMiddleware.js";
import Companymid from "../../middleware/companyMiddleware.js";

import multer from "multer";
const upload = multer();

const jobPostingDataRouter = exprss.Router();

// All Job Specializations
jobPostingDataRouter.get("/all_job_specializations", AllJobSpecialization);

// All Job Types
jobPostingDataRouter.get("/all_job_types", AllJobTypes);

// All Job Benefits
jobPostingDataRouter.get("/all_job_benefits", AllJobBenefits);

// All Job Career Levels
jobPostingDataRouter.get("/all_job_career_levels", AllJobCareerLevels);

// All Job Qualifications
jobPostingDataRouter.get("/all_job_qualifications", AllJobQualifications);

// All Job Experience Levels
jobPostingDataRouter.get("/all_job_experience_levels", AllJobExperienceLevels);

// All Job Modes
jobPostingDataRouter.get("/all_job_modes", AllJobModes);

// All Job Modes
jobPostingDataRouter.get("/all_company_branches", userAuth, Companymid, AllCompanyBranches);

// Save Job Posting Details API
jobPostingDataRouter.post("/add_job_posting_details", upload.none(), userAuth, Companymid, AddJobPostingDetails);

// Get Job Posting Details API
jobPostingDataRouter.get("/get_job_posting_details", userAuth, Companymid, GetJobPostingDetails);

// Edit Job Posting Details API
jobPostingDataRouter.post("/edit_job_posting_details", upload.none(), userAuth, Companymid, EditJobPostingDetails);

// Confirm Job Posting Details API
jobPostingDataRouter.post("/confirm_job_posting_details", upload.none(), userAuth, Companymid, ConfirmJobPostingDetails);

// Get All Job Listing API
jobPostingDataRouter.get("/get_all_job_listing", userAuth, Companymid, getAllJobListing);

// Delete Job Posting API
jobPostingDataRouter.delete("/delete_job_posting", upload.none(), userAuth, Companymid, deleteJobPosting);

// Get All Job Listing API
jobPostingDataRouter.get("/get_job_preview_details", userAuth, getJobPreviewDetails);

export default jobPostingDataRouter;