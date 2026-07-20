import { Router } from 'express'
import userAuth from '../../middleware/authMiddleware.js';
import { GeneratePdf, GetAllcompanydata } from '../../controllers/demo/DemoController.js';
import validateRequest from '../../validation/validateRequest.js';
import { ResumeSchema } from '../../controllers/demo/validation/ResumeValidate.js';
const DemoRouter = Router()





DemoRouter.post("/generate-pdf", userAuth, validateRequest(ResumeSchema), GeneratePdf)
DemoRouter.get("/get-all-company-data", userAuth, GetAllcompanydata)



export default DemoRouter
