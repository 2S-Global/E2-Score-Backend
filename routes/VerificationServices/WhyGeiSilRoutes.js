import { Router } from "express";
import { CreateWhyGeisil, DeleteWhyGeisil, GetWhyGeisil, UpdateWhyGeisil } from "../../controllers/VerificationServices/WhyGeiSilController.js";
import userAuth from "../../middleware/authMiddleware.js";
import Adminmid from "../../middleware/adminMiddleware.js";

const WhyGeisilRouter = Router();

WhyGeisilRouter.post("/create", userAuth , Adminmid, CreateWhyGeisil);
WhyGeisilRouter.get("/get", GetWhyGeisil);
WhyGeisilRouter.put("/update/:id", userAuth , Adminmid, UpdateWhyGeisil);
WhyGeisilRouter.delete("/delete/:id", userAuth , Adminmid, DeleteWhyGeisil);

export default WhyGeisilRouter;
