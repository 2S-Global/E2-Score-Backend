import { Router } from "express";
import { createMentalTestFeedBackController, getAllFeedBackForm, getAllMentalTestHeader, submitMentalTestFeedBackController } from "../../controllers/MentalFeedBack/createMentalTestFeedBackController.js";
import Adminmid from "../../middleware/adminMiddleware.js";
import userAuth from "../../middleware/authMiddleware.js";


const MentalFeedBackRouter = Router()


MentalFeedBackRouter.post('/create-feedback-form', createMentalTestFeedBackController)
MentalFeedBackRouter.post('/submit-feedback', userAuth, submitMentalTestFeedBackController)
MentalFeedBackRouter.get('/get-feedback-form', userAuth, getAllFeedBackForm)
MentalFeedBackRouter.get('/get-all-test-header', getAllMentalTestHeader)


export default MentalFeedBackRouter