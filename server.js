import express from "express";
import cors from "cors";
import helmet from "helmet";

import path from "path";
import { fileURLToPath } from "url";

import db from "./config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

db();

const app = express();
// Middleware
app.use(cors());
app.use(helmet());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// app.use("/images", express.static(path.join(__dirname, "public", "images")));
app.use("/images", express.static(path.join(__dirname, "public/images")));

app.use("/upload", express.static(path.join(process.cwd(), "upload")));

// Import routes
import contactRouter from "./routes/contactRoutes.js";
import AuthRouter from "./routes/AuthRoutes.js";
import userSkillsRoutes from "./routes/userSkillsRoutes.js";
import userProjectsRoutes from "./routes/userProjectsRoutes.js";
import userEmploymentRoutes from "./routes/userEmploymentRoutes.js";
import userEducationRoutes from "./routes/userEducationRoutes.js";
import userVerificationRoutes from "./routes/userVerificationRoutes.js";
import userVerificationCartRoutes from "./routes/userVerificationCartRoutes.js";
import pdfRouter from "./routes/pdfRoutes.js";
import pacakageRoute from "./routes/admin/pacakageRoute.js";
import companyPackageRoute from "./routes/admin/companyPackageRoute.js";
import companyRoutes from "./routes/admin/companyRoutes.js";
import itskillRouter from "./routes/candidate/itskillRoute.js";
import projectDetailsRouter from "./routes/candidate/projectDetailsRoute.js";
//import form Dropdown routes
import DropdownRouterouter from "./routes/sql/DropdownRoute.js";
import MongoDropdownRouter from "./routes/mongo/mongoDropdownRoute.js";

//candidate Routes
import userRouter from "./routes/candidate/useractionRoute.js";
import userdataRouter from "./routes/candidate/userdataRoute.js";
import dashboardRoute from "./routes/admin/dashboardRoute.js";
import userPersonalRouter from "./routes/candidate/userPersonalRoute.js";
import userAccomplishmentRouter from "./routes/candidate/userAccomplishmentRoute.js";
import resumeFileRouter from "./routes/candidate/resumeFileRoute.js";
import employmentRouter from "./routes/candidate/EmploymentRoute.js";
import resumeMakingRouter from "./routes/candidate/resumeMakingRoute.js";
import candidateVerificationCartRouter from "./routes/candidate/candidateVerificationCartRoute.js";
import CandidateCartRouter from "./routes/candidate/cart/cartRoute.js";
import CandidateKycRoute from "./routes/candidate/CandidateKycRoute.js";
import CandidateJobListingRouter from "./routes/candidate/CandidateJobListingRoute.js";
import CandidateDetailsRouter from "./routes/candidate/candidateDetailsRoute.js";
import candidateBookmarkRouter from "./routes/admin/candidateBookmarkRoute.js";

//company Routes
import CompanyProfileRouter from "./routes/company/CompanyProfileRoute.js";
import jobPostingDataRouter from "./routes/company/JobPostingDataRoute.js";
import CompanyKycRoute from "./routes/company/companykycRoute.js";
//Institute Routes
import InstituteProfileRouter from "./routes/institute/InstituteProfileRoute.js";
import InstituteStudentRouter from "./routes/institute/instituteStudentRoute.js";
// Payment Routes
import paymentRoutes from "./routes/paymentRoutes.js";

//admin Routes
import userAdminRouter from "./routes/admin/userRoute.js";

// Temporary route configuration
// ⚠️ NOTE: Do not open, edit, or create `modify.js` inside the routes folder.
// This file is reserved for internal use and should remain untouched.
//Do not edit or uncomment this
/* import Mrouter from "./routes/modify.js";
app.use("/api/modify", Mrouter); */

// Routes
app.get("/", (req, res) => {
  res.send("Welcome to the back end of the E2 Score ");
});
app.use("/api/auth", AuthRouter);
app.use("/api/skills", userSkillsRoutes);
app.use("/api/projects", userProjectsRoutes);
app.use("/api/employment", userEmploymentRoutes);
app.use("/api/education", userEducationRoutes);
app.use("/api/verify", userVerificationRoutes);
app.use("/api/usercart", userVerificationCartRoutes);
app.use("/api/pdf", pdfRouter);
app.use("/api/contacts", contactRouter);

//dropdown routes
// app.use("/api/sql/dropdown", DropdownRouterouter);
//Mongo Dropdown Routes
app.use("/api/sql/dropdown", MongoDropdownRouter);

// Payment Routes
app.use("/api/payment", paymentRoutes);

//candidate routes
app.use("/api/useraction", userRouter);
app.use("/api/userdata", userdataRouter);
app.use("/api/candidate/personal", userPersonalRouter);
app.use("/api/candidate/accomplishments", userAccomplishmentRouter);
app.use("/api/candidate/itskill", itskillRouter);
app.use("/api/candidate/project", projectDetailsRouter);
app.use("/api/candidate/resumefile", resumeFileRouter);
app.use("/api/candidate/employment", employmentRouter);
app.use("/api/candidate/resume", resumeMakingRouter);
app.use("/api/candidate/usercart", candidateVerificationCartRouter);
app.use("/api/candidate/cart", CandidateCartRouter);
app.use("/api/candidatekyc", CandidateKycRoute);
app.use("/api/candidate/joblisting", CandidateJobListingRouter);
app.use("/api/candidate/candidateDetails", CandidateDetailsRouter);

// Start server hello

// Admin Routes test
app.use("/api/pacakageRoute", pacakageRoute);
app.use("/api/companyPackageRoute", companyPackageRoute);
app.use("/api/companyRoutes", companyRoutes);
app.use("/api/dashboard", dashboardRoute);

//Admin Routes Abhishek Dey
app.use("/api/useradmin", userAdminRouter);

//company routes
app.use("/api/companyprofile", CompanyProfileRouter);
app.use("/api/jobposting", jobPostingDataRouter);
app.use("/api/companykyc", CompanyKycRoute);

//Bookmark routes for Admin
app.use("/api/candidatebookmark", candidateBookmarkRouter);

//institute routes
//Testing
app.use("/api/instituteprofile", InstituteProfileRouter);
app.use("/api/institutestudent", InstituteStudentRouter);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
