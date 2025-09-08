import exprss from "express";

//controller
import {
  getUser,
  getResumeHeadline,
  getProfileSummary,
  getUserDetails,
  getcandidateskills,
  getUserEducation,
  getUserLevelDetails,
  getEditUserData,
  getOnlyStudentName,
  getCandidateInfo
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

//get user Level details
userdataRouter.get("/get_user_level", userAuth, getUserLevelDetails);

//get Edit User data
userdataRouter.get("/get_edit_user_data", userAuth, getEditUserData);

//get student name
userdataRouter.get("/get_only_student_name", userAuth, getOnlyStudentName);

//get student name
userdataRouter.get("/get_candidate_info", userAuth, getCandidateInfo);

export default userdataRouter;
