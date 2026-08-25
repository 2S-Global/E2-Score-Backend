import { Router } from "express";
import { createReportGeneration } from "../../controllers/reportGeneration/reportGenerationController.js";
import Adminmid from "../../middleware/adminMiddleware.js";
const reportGenerationRouter = Router();

// Get /api/auth
reportGenerationRouter.post("/", createReportGeneration)



export default reportGenerationRouter           