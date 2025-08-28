import express from "express";
import multer from "multer";

// Controllers
import {
  AddorUpdateCompany,
  GetCompanyDetails,
  Deletecoverphoto,
  GetAccountDetails,
  updateAccountDetails,
} from "../../controllers/institute/CompanyProfileControllers.js";

import {
  AddorUpdateContactPerson,
  GetContactPerson,
} from "../../controllers/company/ContactPersonControllers.js";

import {
  addOrUpdateSocial,
  getSocial,
} from "../../controllers/company/CompanySocialControllers.js";

// Middleware
import userAuth from "../../middleware/authMiddleware.js";
import Institutemid from "../../middleware/InstituteMiddleware.js";

// Initialize router
const InstituteProfileRouter = express.Router();

// Setup multer with memory storage for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// ================= COMPANY ROUTES =================
// Add or Update Company Profile
InstituteProfileRouter.post(
  "/add_or_update_company",
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "cover", maxCount: 1 },
  ]),
  userAuth,
  Institutemid,
  AddorUpdateCompany
);

// Get Company Details
InstituteProfileRouter.get(
  "/get_company_details",
  userAuth,
  Institutemid,
  GetCompanyDetails
);

// Delete Cover Photo
InstituteProfileRouter.delete(
  "/delete_cover_photo",
  userAuth,
  Institutemid,
  Deletecoverphoto
);

// ================= ACCOUNT ROUTES =================

// Get Account Details
InstituteProfileRouter.get(
  "/get_account_details",
  userAuth,
  Institutemid,
  GetAccountDetails
);

// Update Account Details
InstituteProfileRouter.put(
  "/update_account_details",
  upload.none(),
  userAuth,
  Institutemid,
  updateAccountDetails
);

// ================= CONTACT PERSON ROUTES =================

// Add or Update Contact Person
InstituteProfileRouter.post(
  "/add_or_update_contact_person",
  upload.none(),
  userAuth,
  Institutemid,
  AddorUpdateContactPerson
);

// Get Contact Person
InstituteProfileRouter.get(
  "/get_contact_person",
  userAuth,
  Institutemid,
  GetContactPerson
);

// ================= SOCIAL ROUTES =================

// Add or Update Social
InstituteProfileRouter.post(
  "/add_or_update_social",
  upload.none(),
  userAuth,
  Institutemid,
  addOrUpdateSocial
);

// Get Social
InstituteProfileRouter.get("/get_social", userAuth, Institutemid, getSocial);

export default InstituteProfileRouter;
