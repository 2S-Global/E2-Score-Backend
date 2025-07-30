import express from "express";
import multer from "multer";

// Controllers
import {
  SearchCompanybyCin,
  AddorUpdateCompany,
  GetCompanyDetails,
  Deletecoverphoto,
  GetAccountDetails,
  updateAccountDetails,
} from "../../controllers/company/CompanyProfileControllers.js";

import {
  AddorUpdateContactPerson,
  GetContactPerson,
} from "../../controllers/company/ContactPersonControllers.js";

// Middleware
import userAuth from "../../middleware/authMiddleware.js";
import Companymid from "../../middleware/companyMiddleware.js";

// Initialize router
const CompanyProfileRouter = express.Router();

// Setup multer with memory storage for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// ================= COMPANY ROUTES =================

// Search Company by CIN
CompanyProfileRouter.post("/search_company_by_cin", SearchCompanybyCin);

// Add or Update Company Profile
CompanyProfileRouter.post(
  "/add_or_update_company",
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "cover", maxCount: 1 },
  ]),
  userAuth,
  Companymid,
  AddorUpdateCompany
);

// Get Company Details
CompanyProfileRouter.get(
  "/get_company_details",
  userAuth,
  Companymid,
  GetCompanyDetails
);

// Delete Cover Photo
CompanyProfileRouter.delete(
  "/delete_cover_photo",
  userAuth,
  Companymid,
  Deletecoverphoto
);

// ================= ACCOUNT ROUTES =================

// Get Account Details
CompanyProfileRouter.get(
  "/get_account_details",
  userAuth,
  Companymid,
  GetAccountDetails
);

// Update Account Details
CompanyProfileRouter.put(
  "/update_account_details",
  upload.none(),
  userAuth,
  Companymid,
  updateAccountDetails
);

// ================= CONTACT PERSON ROUTES =================

// Add or Update Contact Person
CompanyProfileRouter.post(
  "/add_or_update_contact_person",
  upload.none(),
  userAuth,
  Companymid,
  AddorUpdateContactPerson
);

// Get Contact Person
CompanyProfileRouter.get(
  "/get_contact_person",
  userAuth,
  Companymid,
  GetContactPerson
);

export default CompanyProfileRouter;
