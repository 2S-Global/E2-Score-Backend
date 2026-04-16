import express from "express";
import multer from "multer";


import {
 instituteCourse
} from "../../controllers/institute/instituteCourseController.js";
// Middleware
import userAuth from "../../middleware/authMiddleware.js";
import Institutemid from "../../middleware/InstituteMiddleware.js";


// Initialize router
const InstituteCourseRoute = express.Router();

// Setup multer with memory storage for file uploads
const upload = multer({ storage: multer.memoryStorage() });



InstituteCourseRoute.get(
  "/course",
   userAuth,
  Institutemid,
  instituteCourse
);
export default InstituteCourseRoute;
