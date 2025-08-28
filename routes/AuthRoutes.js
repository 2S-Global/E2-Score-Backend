import express from "express";
import multer from "multer";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import {
  registerUser,
  loginUser,
  registerCompany,
  forgotPassword,
  validtoken,
  registerInstitute,
  registerInstituteft,
} from "../controllers/AuthController.js"; // Adjust the path according to your project structure
// Initialize dotenv to load environment variables
dotenv.config();
// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
import userAuth from "../middleware/authMiddleware.js";

// Initialize router
const AuthRouter = express.Router();
// Setup multer with memory storage for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
// Register user candidate
AuthRouter.post("/register", upload.none(), registerUser);
// Register user institute
AuthRouter.post("/register-institute", upload.none(), registerInstituteft);
// Login user
AuthRouter.post("/login", upload.none(), loginUser);
// Register company
AuthRouter.post("/company-register", upload.none(), registerCompany);
// Register institute
AuthRouter.post("/institute-register", upload.none(), registerInstitute);

AuthRouter.post("/forgotpass", upload.none(), forgotPassword);

//validate token
AuthRouter.get("/validtoken", userAuth, validtoken);

export default AuthRouter;
