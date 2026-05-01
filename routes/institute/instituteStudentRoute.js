import express from "express";
import multer from "multer";

//import controllers
import {
  GetunverifiedStudents,
  GetverifiedStudents,
  GetstudentDetails,
  UpdatestudentStatus,
  GetallStudents,
  GetStudentsByVerification,
  instituteStudent,
  addCustomCourse,
  updateCustomCourse,
  deleteCustomCourse,
  getAllCourses,
  instituteStudentSearch
} from "../../controllers/institute/instituteStudentController.js";

import {
  insStudentImport,
  addInstituteStudentManually,
  deleteInstituteStudent,
} from "../../controllers/institute/instituteStudentImport.js";

import {
  insStudentMarksImport
} from "../../controllers/institute/instituteStudentImportMarks.js";


// Middleware
import userAuth from "../../middleware/authMiddleware.js";
import Institutemid from "../../middleware/InstituteMiddleware.js";
import csvFile from "../../middleware/csvMiddleware.js";

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
  "/get_students_by_status",
  userAuth,
  Institutemid,
  GetStudentsByVerification
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

InstituteStudentRouter.post(
  "/import-candidates",
  userAuth,
  Institutemid,
  csvFile.single("csv"),
  insStudentImport
);
InstituteStudentRouter.post(
  "/import-candidates-marks",
  userAuth,
  Institutemid,
  csvFile.single("csv"),
  insStudentMarksImport
);
InstituteStudentRouter.get(
  "/institute-student-list",
  userAuth,
  Institutemid,
  instituteStudent
);

// Add Custom Course
InstituteStudentRouter.post(
  "/add-custom-course",
  userAuth,
  Institutemid,
  upload.none(),
  addCustomCourse,
);

//Update Custom Course
InstituteStudentRouter.put(
  "/update-custom-course",
  userAuth,
  Institutemid,
  upload.none(),
  updateCustomCourse,
);

// Delete Custom Course
InstituteStudentRouter.delete(
  "/delete-custom-course",
  userAuth,
  Institutemid,
  upload.none(),
  deleteCustomCourse,
);

// Get All Courses
InstituteStudentRouter.get(
  "/get-all-courses",
  userAuth,
  Institutemid,
  getAllCourses
);

// Add Institute Student Manually
InstituteStudentRouter.post(
  "/add-institute-student-manually",
  userAuth,
  Institutemid,
  addInstituteStudentManually
);

// Delete Institute Student Manually
InstituteStudentRouter.delete(
  "/delete-institute-student",
  userAuth,
  Institutemid,
  upload.none(),
  deleteInstituteStudent,
);
// Get All Courses
InstituteStudentRouter.get(
  "/institute-student-search",
  userAuth,
  Institutemid,
  instituteStudentSearch
);


export default InstituteStudentRouter;