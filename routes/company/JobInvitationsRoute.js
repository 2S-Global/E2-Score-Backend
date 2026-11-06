import express from "express";
import {
  addJobInvitation,
  excelUploadJobInvitation,
  getJobInvitationList,
  redeemJobInvitationHandoff,
  respondToJobInvitation,
  showJobInvitationResponse,
} from "../../controllers/company/JobInvitationsController.js";
import userAuth from "../../middleware/authMiddleware.js";
import Companymid from "../../middleware/companyMiddleware.js";
import csvFile from "../../middleware/csvMiddleware.js";

const jobInvitationsRouter = express.Router();

jobInvitationsRouter.post("/add", userAuth, Companymid, addJobInvitation);
jobInvitationsRouter.post(
  "/excel-upload",
  userAuth,
  Companymid,
  csvFile.single("csv"),
  excelUploadJobInvitation,
);
jobInvitationsRouter.get("/list", userAuth, Companymid, getJobInvitationList);
jobInvitationsRouter.get("/respond", showJobInvitationResponse);
jobInvitationsRouter.post(
  "/respond",
  express.urlencoded({ extended: false }),
  respondToJobInvitation,
);
jobInvitationsRouter.post(
  "/redeem",
  express.json(),
  redeemJobInvitationHandoff,
);

export default jobInvitationsRouter;
