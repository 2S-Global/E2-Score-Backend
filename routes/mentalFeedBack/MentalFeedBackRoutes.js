import { Router } from "express";
import { createMentalTestFeedBackController, getAllFeedBackForm, submitMentalTestFeedBackController } from "../../controllers/MentalFeedBack/createMentalTestFeedBackController.js";
import Adminmid from "../../middleware/adminMiddleware.js";
import userAuth from "../../middleware/authMiddleware.js";


const MentalFeedBackRouter = Router()


MentalFeedBackRouter.post('/create-feedback-form', Adminmid, createMentalTestFeedBackController)
MentalFeedBackRouter.post('/submit-feedback', userAuth, submitMentalTestFeedBackController)
MentalFeedBackRouter.get('/get-feedback-form', userAuth, getAllFeedBackForm)



export default MentalFeedBackRouter