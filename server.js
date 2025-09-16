import express from "express";
import cors from "cors";
import helmet from "helmet";

import db from "./config/db.js";

db();

const app = express();
// Middleware
app.use(cors());
app.use(helmet());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Import routes
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

//company Routes
import CompanyProfileRouter from "./routes/company/CompanyProfileRoute.js";

//Institute Routes
import InstituteProfileRouter from "./routes/institute/InstituteProfileRoute.js";

// Payment Routes
import paymentRoutes from "./routes/paymentRoutes.js";

//temp routes
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

// Start server hello

// Admin Routes test
app.use("/api/pacakageRoute", pacakageRoute);
app.use("/api/companyPackageRoute", companyPackageRoute);
app.use("/api/companyRoutes", companyRoutes);
app.use("/api/dashboard", dashboardRoute);

//company routes
app.use("/api/companyprofile", CompanyProfileRouter);

//institute routes
app.use("/api/instituteprofile", InstituteProfileRouter);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
