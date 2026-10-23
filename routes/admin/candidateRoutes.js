import { Router } from "express";
import Adminmid from "../../middleware/adminMiddleware.js";
import { getCandidateList } from "../../controllers/admin/CandidateController.js";
import userAuth from "../../middleware/authMiddleware.js";

const CandidateRouter = Router();

//ADmin Side mostly

CandidateRouter.get("/list", userAuth, Adminmid, getCandidateList);
export default CandidateRouter;
