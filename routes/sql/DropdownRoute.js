import express from "express";
import {
  All_contry,
  All_gender,
  getSkill,
  getMatchingSkill,
  getEducationLevel,
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
export default DropdownRouterouter;
