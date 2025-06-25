import express from "express";
import multer from "multer";

import { getMatchingCompany, getRandomCompany, addEmploymentDetails, getEmploymentDetails,editEmploymentDetails, getNoticePeriod, deleteEmploymentDetails, getAllCompany } from "../../controllers/candidate/EmploymentController.js";

import userAuth from "../../middleware/authMiddleware.js";

// Initialize router
const employmentRouter = express.Router();
// Setup multer with memory storage for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

employmentRouter.get("/matching_company", getMatchingCompany);
employmentRouter.get("/random_company", getRandomCompany);
employmentRouter.get("/all_company_details", getAllCompany);
employmentRouter.get("/get_notice_period", getNoticePeriod);
employmentRouter.post("/add_employment", userAuth, upload.none(), addEmploymentDetails);
employmentRouter.get("/get_employment", userAuth, getEmploymentDetails);
employmentRouter.put("/edit_employment", userAuth, upload.none(), editEmploymentDetails);
employmentRouter.delete("/delete_employment", userAuth, upload.none(), deleteEmploymentDetails);

export default employmentRouter;