import exprss from "express";

//controller
import { AllJobSpecialization, AllJobTypes, AllJobBenefits, AllJobCareerLevels, AllJobQualifications, AllJobExperienceLevels, AllJobModes, AllCompanyBranches } from "../../controllers/company/JobPostingDataController.js";

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

export default jobPostingDataRouter;