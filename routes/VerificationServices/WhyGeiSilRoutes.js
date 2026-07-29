import { Router } from "express";
import { CreateWhyGeisil, DeleteWhyGeisil, GetWhyGeisil, UpdateWhyGeisil } from "../../controllers/VerificationServices/WhyGeiSilController.js";

const WhyGeisilRouter = Router();

WhyGeisilRouter.post("/create", CreateWhyGeisil);
WhyGeisilRouter.get("/get", GetWhyGeisil);
WhyGeisilRouter.put("/update/:id", UpdateWhyGeisil);
WhyGeisilRouter.delete("/delete/:id", DeleteWhyGeisil);

export default WhyGeisilRouter;
