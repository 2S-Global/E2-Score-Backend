import express from "express";
import {
  All_contry,
  All_gender,
  getSkill,
  getMatchingSkill,
} from "../../controllers/sql/dropdownController.js";

const DropdownRouterouter = express.Router();
//all Country
DropdownRouterouter.get("/All_contry", All_contry);

//all Gender
DropdownRouterouter.get("/All_gender", All_gender);

//get 50 random skills
DropdownRouterouter.get("/Random_Skill", getSkill);

//search skill
DropdownRouterouter.get(
  "/matching_Skill?skill_name =:skill_name ",
  getMatchingSkill
);

export default DropdownRouterouter;
