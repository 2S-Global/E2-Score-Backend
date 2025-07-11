import express from "express";
import {
  All_contry,
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
} from "../../controllers/sql/dropdownController.js";

const DropdownRouterouter = express.Router();
//all Country
DropdownRouterouter.get("/All_contry", All_contry);

//all Gender
DropdownRouterouter.get("/All_gender", All_gender);

//get 50 random skills
DropdownRouterouter.get("/Random_Skill", getSkill);

//search skill
DropdownRouterouter.get("/matching_Skill", getMatchingSkill);

//get education level
DropdownRouterouter.get("/education_level", getEducationLevel);

//get All university state
DropdownRouterouter.get("/all_university_state", getAllState);

//get university by state
DropdownRouterouter.get("/university_state", getUniversityByState);

//get course  by university
DropdownRouterouter.get("/university_course", getCourseByUniversity);

//get Grading System
DropdownRouterouter.get("/grading_system", getGradingSystem);

//get Course Type
DropdownRouterouter.get("/course_type", getCourseType);

//State Wise Board
DropdownRouterouter.get("/state_wise_board", getEducationBoardById);

//Medium Of Education
DropdownRouterouter.get("/medium_of_education", getAllMediumOfEducation);

//Get College Name by University Id
DropdownRouterouter.get("/college_name", getCollegeNameById);

//Get More Information
DropdownRouterouter.get("/more_information", getMoreInformation);

//Get Marital Status
DropdownRouterouter.get("/marital_status", getMaritalStatus);

//Get Category
DropdownRouterouter.get("/category_details", getCategoryDetails);

//Get Visa Type
DropdownRouterouter.get("/visa_type", getVisaType);

//Get Disability Type
DropdownRouterouter.get("/disability_type", getDisabilityType);

//Get Career Break Reason
DropdownRouterouter.get("/career_break_reason", getCareerBreakReason);
//Get Language
DropdownRouterouter.get("/language", getLanguage);

//Get Language Proficiency
DropdownRouterouter.get("/language_proficiency", getLanguageProficiency);

//Get Social Media Profiles
DropdownRouterouter.get("/social_profile", getSocialProfile);

//Get Industry
DropdownRouterouter.get("/get_industry", getIndustry);

//Get Job Department
DropdownRouterouter.get("/get_job_departments", getJobDepartments);

//Get Job Roles
DropdownRouterouter.get("/get_job_roles", getJobRoles);

//Get India Cities
DropdownRouterouter.get("/get_india_cities", getIndiaCities);

//Get Tech Skills
DropdownRouterouter.get("/get_tech_skills", getTechSkills);
export default DropdownRouterouter;
