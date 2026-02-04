import exprss from "express";

//controller
import {
  AllJobSpecialization,
  AllJobTypes,
  AllJobBenefits,
  AllJobCareerLevels,
  AllJobQualifications,
  AllJobExperienceLevels,
  AllJobModes,
  AllCompanyBranches,
  AddJobPostingDetails,
  GetJobPostingDetails,
  EditJobPostingDetails,
  ConfirmJobPostingDetails,
  getAllJobListing,
  deleteJobPosting,
  getJobPreviewDetails,
  AllJobTitles,
  applyJobPosting,
  getAppliedCandidatesByJob,
  getMyAppliedJobs,
  getShortlistedCandidatesByJob,
  getOfferSentCandidatesByJob,
  getInvitationSentCandidatesByJob,
  rejectJobApplicationStatus,
  acceptJobApplicationStatus,
  acceptShortlistedCandidates,
  sentOfferToCandidates,
  submitInterviewFeedback,
  EditLiveJobPostingDetails,
  ConfirmLiveJobPostingDetails,
  GetTempJobPostingDetails,
} from "../../controllers/company/JobPostingDataController.js";

//middleware
import userAuth from "../../middleware/authMiddleware.js";
import Companymid from "../../middleware/companyMiddleware.js";

import multer from "multer";
const upload = multer();

const jobPostingDataRouter = exprss.Router();

// All Job Specializations
jobPostingDataRouter.get("/all_job_title", AllJobTitles);
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
jobPostingDataRouter.get(
  "/all_company_branches",
  userAuth,
  Companymid,
  AllCompanyBranches
);

// Save Job Posting Details API
jobPostingDataRouter.post(
  "/add_job_posting_details",
  upload.none(),
  userAuth,
  Companymid,
  AddJobPostingDetails
);

// Get Job Posting Details API
jobPostingDataRouter.get(
  "/get_job_posting_details",
  userAuth,
  Companymid,
  GetJobPostingDetails
);

// Get Temp Job Posting Details API
jobPostingDataRouter.get(
  "/get_temp_job_posting_details",
  userAuth,
  Companymid,
  GetTempJobPostingDetails
);

// Edit Job Posting Details API
jobPostingDataRouter.post(
  "/edit_job_posting_details",
  upload.none(),
  userAuth,
  Companymid,
  EditJobPostingDetails
);

// Confirm Job Posting Details API
jobPostingDataRouter.post(
  "/confirm_job_posting_details",
  upload.none(),
  userAuth,
  Companymid,
  ConfirmJobPostingDetails
);

// Edit Live Job Posting Details API
jobPostingDataRouter.post(
  "/edit_live_job_posting_details",
  upload.none(),
  userAuth,
  Companymid,
  EditLiveJobPostingDetails
);

// Confirm Live Job Posting Details API
jobPostingDataRouter.post(
  "/confirm_live_job_posting_details",
  upload.none(),
  userAuth,
  Companymid,
  ConfirmLiveJobPostingDetails
);

// Get All Job Listing API
jobPostingDataRouter.get(
  "/get_all_job_listing",
  userAuth,
  Companymid,
  getAllJobListing
);

// Delete Job Posting API
jobPostingDataRouter.delete(
  "/delete_job_posting",
  upload.none(),
  userAuth,
  Companymid,
  deleteJobPosting
);

// Get All Job Listing API
jobPostingDataRouter.get(
  "/get_job_preview_details",
  userAuth,
  getJobPreviewDetails
);

// Applied job API - from employee end
jobPostingDataRouter.post(
  "/apply-job-application",
  upload.none(),
  userAuth,
  applyJobPosting
);

// Get All Job Listing API
jobPostingDataRouter.get(
  "/get_all_job_related_candidates",
  userAuth,
  Companymid,
  getAppliedCandidatesByJob
);

// Get All Job related shortlisted candidates API
jobPostingDataRouter.get(
  "/get_all_job_related_shortlisted_candidates",
  userAuth,
  Companymid,
  getShortlistedCandidatesByJob
);

// Get All Job related offer_sent candidates API
jobPostingDataRouter.get(
  "/get_all_job_related_offer_sent_candidates",
  userAuth,
  Companymid,
  getOfferSentCandidatesByJob
);

// Get All Job related invitation_sent candidates API
jobPostingDataRouter.get(
  "/get_all_job_related_invitation_sent_candidates",
  userAuth,
  Companymid,
  getInvitationSentCandidatesByJob
);

// Reject Job Application API
jobPostingDataRouter.patch(
  "/reject_job_application_status",
  upload.none(),
  userAuth,
  Companymid,
  rejectJobApplicationStatus
);

// Accept Job Application API
jobPostingDataRouter.patch(
  "/accept_job_application_status",
  upload.none(),
  userAuth,
  Companymid,
  acceptJobApplicationStatus
);

// Accept Shortlisted Candidates API
jobPostingDataRouter.patch(
  "/accept_shortlisted_candidates",
  upload.none(),
  userAuth,
  Companymid,
  acceptShortlistedCandidates
);

// Sent Offer to Candidates API
jobPostingDataRouter.patch(
  "/sent_offer_to_candidates",
  upload.none(),
  userAuth,
  Companymid,
  sentOfferToCandidates
);

// Save Interview Feedback API
jobPostingDataRouter.post(
  "/save_interview_feedback",
  upload.none(),
  userAuth,
  Companymid,
  submitInterviewFeedback
);

// Get All Job Listing API
jobPostingDataRouter.get(
  "/get_all_my_applied_job",
  userAuth,
  getMyAppliedJobs
);

export default jobPostingDataRouter;