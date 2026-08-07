import { Router } from "express";
import { createMentalTestFeedBackController, deleteMentalTestFeedBackController, getAllFeedBackForm, getAllMentalTestHeader, submitMentalTestFeedBackController, updateMentalTestFeedBackController } from "../../controllers/MentalFeedBack/createMentalTestFeedBackController.js";
import Adminmid from "../../middleware/adminMiddleware.js";
import userAuth from "../../middleware/authMiddleware.js";


const MentalFeedBackRouter = Router()


MentalFeedBackRouter.post('/create-feedback-form', userAuth, Adminmid, createMentalTestFeedBackController)
MentalFeedBackRouter.post('/submit-feedback', userAuth, submitMentalTestFeedBackController)
MentalFeedBackRouter.get('/get-feedback-form', userAuth, getAllFeedBackForm)
MentalFeedBackRouter.get('/get-all-test-header', getAllMentalTestHeader)
MentalFeedBackRouter.patch('/update-feedback-form/:id', updateMentalTestFeedBackController)
MentalFeedBackRouter.delete('/delete/:id', deleteMentalTestFeedBackController)


export default MentalFeedBackRouter
