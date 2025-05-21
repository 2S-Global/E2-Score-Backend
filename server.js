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

//import form location routes
import LocationRouterouter from "./routes/sql/LocationRoute.js";

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

//location routes
app.use("/api/sql/locations", LocationRouterouter);
// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
