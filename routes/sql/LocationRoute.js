import express from "express";
import { All_contry } from "../../controllers/sql/locationController.js";

const LocationRouterouter = express.Router();

LocationRouterouter.get("/All_contry", All_contry);

export default LocationRouterouter;
