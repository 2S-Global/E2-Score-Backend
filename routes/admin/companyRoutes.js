import express from "express";
import multer from "multer";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import {
  changePassword,
  registerCompanyUser,
  registerCompany,
  listCompanies,
  deleteCompany,
  toggleCompanyStatus,
  editUser,
  listFieldsByCompany,
  getUserDetailsById,
  listSelfRegisteredCompanies,
  sendAccessEmail,
  getSwitchedRoleDetails,
} from "../../controllers/admin/companyController.js";
// Initialize dotenv to load environment variables

import userAuth from "../../middleware/authMiddleware.js";
import adminMiddleware from "../../middleware/adminMiddleware.js";
 // Adjust path if needed

dotenv.config();
// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
// Initialize router
const AuthRouter = express.Router();
// Setup multer with memory storage for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
//chabnge password
AuthRouter.post("/change-password", upload.none(), userAuth, changePassword);

//AuthRouter.post( "/register-frontend", upload.none(), RegisterFrontEnd);


// Register user candidate
AuthRouter.post("/register", userAuth, adminMiddleware, upload.none(), registerCompanyUser);
AuthRouter.post("/edit_user", userAuth, adminMiddleware, upload.none(), editUser);
AuthRouter.post("/list_fields_by_company", userAuth, adminMiddleware, upload.none(), listFieldsByCompany);
AuthRouter.post("/get_company_details", upload.none(), getUserDetailsById);

// Login user

AuthRouter.post("/sendAccessEmail", upload.none(), userAuth, adminMiddleware, sendAccessEmail);

// Register company
AuthRouter.post("/company-register", upload.none(),  userAuth,  adminMiddleware,  registerCompany);
AuthRouter.post("/list-companies", userAuth, adminMiddleware, listCompanies);
AuthRouter.post("/list-companies-self", userAuth, adminMiddleware, listSelfRegisteredCompanies);
AuthRouter.post("/delete-companies", userAuth, adminMiddleware, deleteCompany);
AuthRouter.post( "/togglestatus-companies", userAuth, adminMiddleware, toggleCompanyStatus);


AuthRouter.get("/switched-role-user", userAuth, getSwitchedRoleDetails);

export default AuthRouter;