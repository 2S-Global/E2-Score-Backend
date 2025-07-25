import express from "express";
import multer from "multer";

import { SearchCompanybyCin } from "../../controllers/company/CompanyProfileControllers.js";

import userAuth from "../../middleware/authMiddleware.js";
import Companymid from "../../middleware/companyMiddleware.js";

// Initialize router
const CompanyProfileRouter = express.Router();

// Setup multer with memory storage for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

CompanyProfileRouter.post("/search_company_by_cin", SearchCompanybyCin);

export default CompanyProfileRouter;
