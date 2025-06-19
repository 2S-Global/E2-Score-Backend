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
//import form Dropdown routes
import DropdownRouterouter from "./routes/sql/DropdownRoute.js";

//candidate Routes
import userRouter from "./routes/candidate/useractionRoute.js";
import userdataRouter from "./routes/candidate/userdataRoute.js";
import dashboardRoute from "./routes/admin/dashboardRoute.js";
import userPersonalRouter from "./routes/candidate/userPersonalRoute.js";
import userAccomplishmentRouter from "./routes/candidate/userAccomplishmentRoute.js";
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
app.use("/api/sql/dropdown", DropdownRouterouter);

//candidate routes
app.use("/api/useraction", userRouter);
app.use("/api/userdata", userdataRouter);
app.use("/api/candidate/personal", userPersonalRouter);
app.use("/api/candidate/accomplishments", userAccomplishmentRouter);
app.use("/api/candidate/itskill", itskillRouter);
// Start server hello

// Admin Routes test
app.use("/api/pacakageRoute", pacakageRoute);
app.use("/api/companyPackageRoute", companyPackageRoute);
app.use("/api/companyRoutes", companyRoutes);
app.use("/api/dashboard", dashboardRoute);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
