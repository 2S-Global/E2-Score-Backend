import express from "express";
import {
  addJobInvitation,
  getJobInvitationList,
  redeemJobInvitationHandoff,
  respondToJobInvitation,
  showJobInvitationResponse,
} from "../../controllers/company/JobInvitationsController.js";
import userAuth from "../../middleware/authMiddleware.js";
import Companymid from "../../middleware/companyMiddleware.js";

const jobInvitationsRouter = express.Router();

jobInvitationsRouter.post("/add", userAuth, Companymid, addJobInvitation);
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
