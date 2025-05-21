import exprss from "express";

//controller
import {
  getUser,
  getResumeHeadline,
} from "../../controllers/candidate/userdatacontroller.js";

//middleware
import userAuth from "../../middleware/authMiddleware.js";

const userdataRouter = exprss.Router();
//get user data
userdataRouter.get("/userdata", userAuth, getUser);

//get Resume Headline
userdataRouter.get("/resume_headline", userAuth, getResumeHeadline);

export default userdataRouter;
