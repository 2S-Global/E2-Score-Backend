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
  GetCompanyTypes,
} from "../../controllers/company/CompanyProfileControllers.js";

import {
  AddorUpdateContactPerson,
  GetContactPerson,
} from "../../controllers/company/ContactPersonControllers.js";

import {
  addOrUpdateSocial,
  getSocial,
} from "../../controllers/company/CompanySocialControllers.js";

import {
  getConunty,
  getStateByConunty,
  getCityByState,
  addBranch,
  editBranch,
  deleteBranch,
  getBranches,
  getUserAssociatedWithCompany,
  getMultipleEmployeeDetails,
  addEmployeeVerificationDetails,
  getVerifiedUser,
  getCompanyLogoByJobId,
} from "../../controllers/company/CompanyBranchControllers.js";

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

// Get Company Types
CompanyProfileRouter.get("/get_company_types", GetCompanyTypes);

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

// ================= SOCIAL ROUTES =================

// Add or Update Social
CompanyProfileRouter.post(
  "/add_or_update_social",
  upload.none(),
  userAuth,
  Companymid,
  addOrUpdateSocial
);

// Get Social
CompanyProfileRouter.get("/get_social", userAuth, Companymid, getSocial);

// ================= Branch ROUTES =================

// Get Conunty
CompanyProfileRouter.get("/get_conunty", getConunty);

// Get State By Conunty
CompanyProfileRouter.get("/get_state_by_conunty/:id", getStateByConunty);

// Get City By State
CompanyProfileRouter.get("/get_city_by_state/:id", getCityByState);

//ADD BRANCH
CompanyProfileRouter.post(
  "/add_branch",
  upload.none(),
  userAuth,
  Companymid,
  addBranch
);

//EDIT BRANCH
CompanyProfileRouter.post(
  "/edit_branch",
  upload.none(),
  userAuth,
  Companymid,
  editBranch
);

//DELETE BRANCH
CompanyProfileRouter.delete(
  "/delete_branch",
  upload.none(),
  userAuth,
  Companymid,
  deleteBranch
);

//GET BRANCHES
CompanyProfileRouter.get("/get_branches", userAuth, Companymid, getBranches);

// Get User Profile
CompanyProfileRouter.get(
  "/get_user_associated_with_company",
  userAuth,
  Companymid,
  getUserAssociatedWithCompany
);

// Get Employee Details who are associated with company
CompanyProfileRouter.get(
  "/get_employee_details",
  userAuth,
  Companymid,
  getMultipleEmployeeDetails
);

// Add Employee Verification Details By Company
CompanyProfileRouter.post(
  "/add_employee_verification_details",
  upload.none(),
  userAuth,
  Companymid,
  addEmployeeVerificationDetails
);

// Get User Profile who is verified with company
CompanyProfileRouter.get(
  "/get_verified_user",
  userAuth,
  Companymid,
  getVerifiedUser
);


CompanyProfileRouter.get(
  "/get-company-logo-by-job",
  getCompanyLogoByJobId
);

export default CompanyProfileRouter;
