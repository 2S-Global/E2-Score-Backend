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
  getCandidateInfo,
  getCandidateImg,
  candidatePhoneNumberVerify,
  candidateVerifyOtp
} from "../../controllers/candidate/userdatacontroller.js";

//middleware
import userAuth from "../../middleware/authMiddleware.js";
import multer from "multer";
const upload = multer();

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

//get candidate name, phone_number, email
userdataRouter.get("/get_candidate_info", userAuth, getCandidateInfo);

//get candidate image url
userdataRouter.get("/get_candidate_img", userAuth, getCandidateImg);

//Candidate send OTP to phone number API
userdataRouter.post("/candidate_phonenumber_verify", userAuth, upload.none(), candidatePhoneNumberVerify);

//Candidate OTP verify API
userdataRouter.post("/verify-otp", userAuth, upload.none(), candidateVerifyOtp);

//Get Name By Token
// userdataRouter.get("/get_name_by_token", userAuth, getNameByToken);

export default userdataRouter;