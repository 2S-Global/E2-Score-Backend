import express from "express";
import multer from "multer";

import {
  SearchCompanybyCin,
  AddorUpdateCompany,
  GetCompanyDetails,
  Deletecoverphoto,
  GetAccountDetails,
  updateAccountDetails,
} from "../../controllers/company/CompanyProfileControllers.js";

import userAuth from "../../middleware/authMiddleware.js";
import Companymid from "../../middleware/companyMiddleware.js";

// Initialize router
const CompanyProfileRouter = express.Router();

// Setup multer with memory storage for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
//Search Company
CompanyProfileRouter.post("/search_company_by_cin", SearchCompanybyCin);
//Update Company
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
//Get Company Details
CompanyProfileRouter.get(
  "/get_company_details",
  userAuth,
  Companymid,
  GetCompanyDetails
);

//Delete Cover Photo
CompanyProfileRouter.delete(
  "/delete_cover_photo",
  userAuth,
  Companymid,
  Deletecoverphoto
);
//Get Account Details
CompanyProfileRouter.get(
  "/get_account_details",
  userAuth,
  Companymid,
  GetAccountDetails
);
//Update Account Details
CompanyProfileRouter.put(
  "/update_account_details",
  upload.none(),
  userAuth,
  Companymid,
  updateAccountDetails
);

export default CompanyProfileRouter;
