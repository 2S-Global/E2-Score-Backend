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
export default DropdownRouterouter;
