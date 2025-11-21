import express from "express";
import multer from "multer";

//import controllers
import {
  GetunverifiedStudents,
  GetverifiedStudents,
  GetstudentDetails,
  UpdatestudentStatus,
  GetallStudents,
} from "../../controllers/institute/instituteStudentController.js";

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

InstituteStudentRouter.get(
  "/get_verified_students",
  userAuth,
  Institutemid,
  GetverifiedStudents
);

InstituteStudentRouter.get(
  "/get_all_students",
  userAuth,
  Institutemid,
  GetallStudents
);

InstituteStudentRouter.get(
  "/get_student_details",
  userAuth,
  Institutemid,
  GetstudentDetails
);

InstituteStudentRouter.put(
  "/update_student_status",
  userAuth,
  Institutemid,
  upload.none(),
  UpdatestudentStatus
);

export default InstituteStudentRouter;
