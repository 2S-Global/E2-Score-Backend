import express from "express";
import {
  createCompanyMailTemplate,
  deleteCompanyMailTemplate,
  getCompanyMailTemplate,
  getCompanyMailTemplates,
  getMailTemplateList,
  updateCompanyMailTemplate,
} from "../../controllers/company/MailTemplatesControllers.js";
import userAuth from "../../middleware/authMiddleware.js";
import Companymid from "../../middleware/companyMiddleware.js";

const mailTemplatesRouter = express.Router();

mailTemplatesRouter.get(
  "/company-mail-templates",
  userAuth,
  Companymid,
  getCompanyMailTemplates,
);
mailTemplatesRouter.post(
  "/company-mail-templates",
  userAuth,
  Companymid,
  createCompanyMailTemplate,
);
mailTemplatesRouter.get(
  "/company-mail-templates/:id",
  userAuth,
  Companymid,
  getCompanyMailTemplate,
);
mailTemplatesRouter.put(
  "/company-mail-templates/:id",
  userAuth,
  Companymid,
  updateCompanyMailTemplate,
);
mailTemplatesRouter.delete(
  "/company-mail-templates/:id",
  userAuth,
  Companymid,
  deleteCompanyMailTemplate,
);
mailTemplatesRouter.get(
  "/mail-templates",
  userAuth,
  Companymid,
  getMailTemplateList,
);

export default mailTemplatesRouter;
