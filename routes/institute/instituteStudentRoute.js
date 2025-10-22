import express from "express";
import multer from "multer";

//import controllers
import { GetunverifiedStudents } from "../../controllers/institute/instituteStudentController.js";

// Middleware
import userAuth from "../../middleware/authMiddleware.js";
import Institutemid from "../../middleware/InstituteMiddleware.js";

// Initialize router
const InstituteStudentRouter = express.Router();

// Setup multer with memory storage for file uploads
const upload = multer({ storage: multer.memoryStorage() });

InstituteStudentRouter.get(
  "/get_unverfired_students",
  userAuth,
  Institutemid,
  GetunverifiedStudents
);

export default InstituteStudentRouter;
