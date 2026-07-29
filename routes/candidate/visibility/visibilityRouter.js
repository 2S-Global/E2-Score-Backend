import { Router } from "express";
import userAuth from "../../../middleware/authMiddleware.js";
import { getVisibilityController, updateVisibilityController } from "../../../controllers/visibility/visitbilityController.js";


const visibilityRouter = Router();


visibilityRouter.put("/update", userAuth, updateVisibilityController);

visibilityRouter.get("/get", userAuth, getVisibilityController);

export default visibilityRouter;