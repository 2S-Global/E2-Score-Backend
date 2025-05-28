import exprss from "express";

//controller
import {
  getUser,
  getResumeHeadline,
  getProfileSummary,
  getUserDetails,
  getcandidateskills,
  getUserEducation,
} from "../../controllers/candidate/userdatacontroller.js";

//middleware
import userAuth from "../../middleware/authMiddleware.js";

const userdataRouter = exprss.Router();
//get user data
userdataRouter.get("/userdata", userAuth, getUser);

//get Resume Headline
userdataRouter.get("/resume_headline", userAuth, getResumeHeadline);

//get Profile Summary
userdataRouter.get("/profile_summary", userAuth, getProfileSummary);

//get user - details
userdataRouter.get("/user_details", userAuth, getUserDetails);

//get user skills
userdataRouter.get("/candidateskills", userAuth, getcandidateskills);

//get user education details
userdataRouter.get("/get_user_education", userAuth, getUserEducation);

export default userdataRouter;
