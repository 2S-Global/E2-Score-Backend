import { Router } from "express";
import Adminmid from "../../middleware/adminMiddleware.js";
import { createMentalTestController, getAllMentalTestQuestionsController, deleteMentalTestQuestion, updateMentalTestQuestion, submitMentalTestController, getUserAttemptHistory, getAllCandidateScore } from "../../controllers/MentalTest/MentalTestController.js"
import userAuth from "../../middleware/authMiddleware.js";


const MentalTestQuizRouter = Router()



//ADmin Side mostly
MentalTestQuizRouter.post("/create-question", Adminmid, createMentalTestController)
MentalTestQuizRouter.get('/', userAuth, getAllMentalTestQuestionsController)
MentalTestQuizRouter.patch('/:_id', Adminmid, updateMentalTestQuestion)
MentalTestQuizRouter.delete("/:_id", Adminmid, deleteMentalTestQuestion)
MentalTestQuizRouter.get('/all-candidate-score', Adminmid, getAllCandidateScore)


//user Side MOstly


MentalTestQuizRouter.post('/submit-test', userAuth, submitMentalTestController)
MentalTestQuizRouter.get('/attempt-history', userAuth, getUserAttemptHistory)
export default MentalTestQuizRouter