import {
  replaceMailPlaceholders,
  CompanyMailLayout,
} from "../../../utility/MailTeamplates.js";
import {
  CompanyMailTemplate,
  MailTemplate,
} from "../../../models/company_Models/MailTemplatesModel.js";
export const jobInvitationTemplate = async ({
  name,
  jobTitle,
  companyName = "GEISIL",
  respondUrl,
  loginId,
}) => {
  // Fetch template from database
  let template = "";
  // Fetch template from database
  const templateOne = await MailTemplate.findOne({
    slug: "job_invitation",
  });
  template = templateOne;
  const templateTwo = await CompanyMailTemplate.findOne({
    templateId: templateOne?._id,
    userId: loginId,
  });
  if (templateTwo?.description) {
    template = templateTwo;
  }

  if (!template) {
    throw new Error("Mail template not found");
  }

  const data = {
    candidateName: name,
    jobTitle: jobTitle,
    companyName: companyName,
    jobInvitationUrl: respondUrl,
  };
  let templateDescription = CompanyMailLayout(template.description);
  // Replace placeholders
  return replaceMailPlaceholders(templateDescription, data);
};
