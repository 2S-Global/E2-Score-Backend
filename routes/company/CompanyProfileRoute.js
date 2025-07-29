import express from "express";
import multer from "multer";

import {
  SearchCompanybyCin,
  AddorUpdateCompany,
  GetCompanyDetails,
  Deletecoverphoto,
} from "../../controllers/company/CompanyProfileControllers.js";

import userAuth from "../../middleware/authMiddleware.js";
import Companymid from "../../middleware/companyMiddleware.js";

// Initialize router
const CompanyProfileRouter = express.Router();

// Setup multer with memory storage for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

CompanyProfileRouter.post("/search_company_by_cin", SearchCompanybyCin);

CompanyProfileRouter.post(
  "/add_or_update_company",
  userAuth,
  Companymid,
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "cover", maxCount: 1 },
  ]),
  AddorUpdateCompany
);

CompanyProfileRouter.get(
  "/get_company_details",
  userAuth,
  Companymid,
  GetCompanyDetails
);

/* /delete_cover_photo */
CompanyProfileRouter.delete(
  "/delete_cover_photo",
  userAuth,
  Companymid,
  Deletecoverphoto
);
export default CompanyProfileRouter;
