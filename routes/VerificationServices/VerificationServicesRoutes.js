
import { Router } from "express";
import { DeleteVerificationServices, getAllVerificationServices, UpdateVerificationServices, VerificationServices } from "../../controllers/VerificationServices/VerificationServicesController.js";
import userAuth from "../../middleware/authMiddleware.js";
import Adminmid from "../../middleware/adminMiddleware.js";
import multer from "multer";
import { deleteServiceDetails } from "../../controllers/allHomePageController.js";

const VerificationServicesRouter = Router()



VerificationServicesRouter.post("/", userAuth, Adminmid, VerificationServices)
VerificationServicesRouter.patch("/update-service/:_id", userAuth, Adminmid, UpdateVerificationServices)
VerificationServicesRouter.delete("/delete-service/:_id", userAuth, Adminmid, DeleteVerificationServices)
VerificationServicesRouter.get("/get-all-services", getAllVerificationServices)





export default VerificationServicesRouter 