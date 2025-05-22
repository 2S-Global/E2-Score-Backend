import express from "express";
import {
  All_contry,
  All_gender,
} from "../../controllers/sql/dropdownController.js";

const DropdownRouterouter = express.Router();
//all Country
DropdownRouterouter.get("/All_contry", All_contry);

//all Gender
DropdownRouterouter.get("/All_gender", All_gender);

export default DropdownRouterouter;
