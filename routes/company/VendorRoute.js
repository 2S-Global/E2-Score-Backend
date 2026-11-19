import express from "express";
import {
  addVendor,
  deleteVendor,
  getVendor,
  listVendors,
  updateVendor,
  vendorSubmitRequest,
  vendorSubmitRequestlist,
} from "../../controllers/company/VendorController.js";
import userAuth from "../../middleware/authMiddleware.js";
import Companymid from "../../middleware/companyMiddleware.js";

const vendorRouter = express.Router();
vendorRouter.use(userAuth, Companymid);

vendorRouter.post("/", addVendor);
vendorRouter.post("/submit-request", vendorSubmitRequest);
vendorRouter.get("/submit-request/list", vendorSubmitRequestlist);
vendorRouter.get("/", listVendors);
vendorRouter.get("/:id", getVendor);
vendorRouter.put("/:id", updateVendor);
vendorRouter.delete("/:id", deleteVendor);

export default vendorRouter;
