import express from "express";
import multer from "multer";

// Controllers
import {
  AddorUpdateCompany,
  GetCompanyDetails,
  Deletecoverphoto,
  GetAccountDetails,
  updateAccountDetails,
  syncStudentCourses,
  addCompanyByInstitute,
  editCompanyByInstitute,
  getAllCompaniesByInstitute,
  deleteCompanyByInstitute,
  addCompanyRequirement,
  updateCompanyRequirement,
  getAllCompanyRequirements,
  deleteCompanyRequirement,
  selectStudentForCompany,
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

// Add course details route here according to new requirement
InstituteProfileRouter.post(
  "/add_course_details",
  userAuth,
  Institutemid,
  upload.none(),
  syncStudentCourses
);

// Add company by Institute
InstituteProfileRouter.post(
  "/add_company",
  userAuth,
  Institutemid,
  upload.none(),
  addCompanyByInstitute
);

InstituteProfileRouter.put(
  "/update_company_by_institute",
  userAuth,
  Institutemid,
  upload.none(),
  editCompanyByInstitute
);

InstituteProfileRouter.get("/get_all_companies_by_institute", userAuth, Institutemid, getAllCompaniesByInstitute);

InstituteProfileRouter.delete("/delete_company_by_institute", userAuth, Institutemid, deleteCompanyByInstitute);

InstituteProfileRouter.post("/add_company_requirement", userAuth, Institutemid, upload.none(), addCompanyRequirement);

InstituteProfileRouter.put("/update_company_requirement", userAuth, Institutemid, upload.none(), updateCompanyRequirement);

InstituteProfileRouter.get("/get_company_requirement", userAuth, Institutemid, upload.none(), getAllCompanyRequirements);

InstituteProfileRouter.delete("/delete_company_requirement", userAuth, Institutemid, upload.none(), deleteCompanyRequirement);

InstituteProfileRouter.post("/add_student_assigned_company", userAuth, Institutemid, upload.none(), selectStudentForCompany);

export default InstituteProfileRouter;