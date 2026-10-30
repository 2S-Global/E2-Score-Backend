import {
  replaceMailPlaceholders,
  CompanyMailLayout,
} from "../../../utility/MailTeamplates.js";
import {
  CompanyMailTemplate,
  MailTemplate,
} from "../../../models/company_Models/MailTemplatesModel.js";
export const applicationShortlistedTemplate = async (
  user,
  designation,
  companyName = "GEISIL",
  loginId,
) => {
  let template = "";
  // Fetch template from database
  const templateOne = await MailTemplate.findOne({
    slug: "application_shortlisted",
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
    candidateName: user.name,
    designation: designation,
    companyName: companyName,
  };
  let templateDescription = CompanyMailLayout(template.description);
  // Replace placeholders
  return replaceMailPlaceholders(templateDescription, data);

  /*   const html = `
  <div style="font-family: Arial, sans-serif; color:#333; padding:20px; line-height:1.6; max-width:600px; margin:auto; background:#f9f9f9; border-radius:8px;">
    
    <div style="background:#0052cc; padding:15px 20px; border-radius:8px 8px 0 0;">
      <h2 style="color:#fff; margin:0; font-size:20px;">Application Shortlisted</h2>
    </div>

    <div style="padding:20px; background:#ffffff; border-radius:0 0 8px 8px;">
      <p>Dear <strong>${user.name || "Candidate"}</strong>,</p>
          
      <p>
        We are pleased to inform you that you have been
        <strong>shortlisted</strong> for the next stage of our recruitment process
        for the position of <strong>${designation}</strong> at
        <strong>${companyName}</strong>.
      </p>

      <p>Our team will reach out to you shortly with further details.</p>

      <br />
      <p>Best regards,</p>
      <p><strong>HR Team</strong></p>
    </div>
  </div>
`;

  return html; */
};
