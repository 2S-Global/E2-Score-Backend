import express from "express";
import {
  All_country,
  All_gender,
  getSkill,
  getMatchingSkill,
  getEducationLevel,
  getAllState,
  getUniversityByState,
  getCourseByUniversity,
  getGradingSystem,
  getCourseType,
  getEducationBoardById,
  getAllMediumOfEducation,
  getCollegeNameById,
  getMoreInformation,
  getMaritalStatus,
  getCategoryDetails,
  getVisaType,
  getDisabilityType,
  getCareerBreakReason,
  getLanguage,
  getLanguageProficiency,
  getSocialProfile,
  getIndustry,
  getJobDepartments,
  getJobRoles,
  getIndiaCities,
  getTechSkills,
  getAllSchoolLists,
  GetCourcesSearch,
  AddCourse,
} from "../../controllers/mongo/mongoDropdownController.js";

const MongoDropdownRouter = express.Router();
//Course Search
MongoDropdownRouter.get("/CourcesSearch", GetCourcesSearch);
//Add Course
MongoDropdownRouter.post("/add_course", AddCourse);
//all Country
MongoDropdownRouter.get("/All_contry", All_country);

//all Gender
MongoDropdownRouter.get("/All_gender", All_gender);

//get 50 random skills
MongoDropdownRouter.get("/Random_Skill", getSkill);

//search skill
MongoDropdownRouter.get("/matching_Skill", getMatchingSkill);

//get education level
MongoDropdownRouter.get("/education_level", getEducationLevel);

//get All university state
MongoDropdownRouter.get("/all_university_state", getAllState);

//get university by state
MongoDropdownRouter.get("/university_state", getUniversityByState);

//get course  by university
MongoDropdownRouter.get("/university_course", getCourseByUniversity);

//get Grading System
MongoDropdownRouter.get("/grading_system", getGradingSystem);

//get Course Type
MongoDropdownRouter.get("/course_type", getCourseType);

//State Wise Board
MongoDropdownRouter.get("/state_wise_board", getEducationBoardById);

//Medium Of Education
MongoDropdownRouter.get("/medium_of_education", getAllMediumOfEducation);

//Get College Name by University Id
MongoDropdownRouter.get("/college_name", getCollegeNameById);

//Get More Information
MongoDropdownRouter.get("/more_information", getMoreInformation);

//Get Marital Status
MongoDropdownRouter.get("/marital_status", getMaritalStatus);

//Get Category
MongoDropdownRouter.get("/category_details", getCategoryDetails);

//Get Visa Type
MongoDropdownRouter.get("/visa_type", getVisaType);

//Get Disability Type
MongoDropdownRouter.get("/disability_type", getDisabilityType);

//Get Career Break Reason
MongoDropdownRouter.get("/career_break_reason", getCareerBreakReason);
//Get Language
MongoDropdownRouter.get("/language", getLanguage);

//Get Language Proficiency
MongoDropdownRouter.get("/language_proficiency", getLanguageProficiency);

//Get Social Media Profiles
MongoDropdownRouter.get("/social_profile", getSocialProfile);

//Get Industry
MongoDropdownRouter.get("/get_industry", getIndustry);

//Get Job Department
MongoDropdownRouter.get("/get_job_departments", getJobDepartments);

//Get Job Roles
MongoDropdownRouter.get("/get_job_roles", getJobRoles);

//Get India Cities
MongoDropdownRouter.get("/get_india_cities", getIndiaCities);

//Get Tech Skills
MongoDropdownRouter.get("/get_tech_skills", getTechSkills);

//Get All School List
MongoDropdownRouter.get("/get_school_lists", getAllSchoolLists);

export default MongoDropdownRouter;
