import {
  replaceMailPlaceholders,
  CompanyMailLayout,
  GeneralMailLayout,
} from "../../../utility/MailTeamplates.js";
import {
  CompanyMailTemplate,
  MailTemplate,
} from "../../../models/company_Models/MailTemplatesModel.js";
export const companyEmploymentVerificationStatusTemplate = async (
  employeeName,
  companyName,
  workedInCompanyBool,
  VerifiedBool,
  designationVerifiedBool,
  durationVerifiedBool,
  employmentTypeVerifiedBool,
  remarks,
  loginId,
) => {
  let verificationStatus = `
      <ul>
        <li>Worked in Company: <strong>${
          workedInCompanyBool ? "✅ Yes" : "❌ No"
        }</strong></li>
        <li>Overall Employment Verified: <strong>${
          VerifiedBool ? "✅ Yes" : "❌ No"
        }</strong></li>
        <li>Designation Verified: <strong>${
          designationVerifiedBool ? "✅ Yes" : "❌ No"
        }</strong></li>
        <li>Duration Verified: <strong>${
          durationVerifiedBool ? "✅ Yes" : "❌ No"
        }</strong></li>
        <li>Employment Type Verified: <strong>${
          employmentTypeVerifiedBool ? "✅ Yes" : "❌ No"
        }</strong></li>
      </ul>
    `;

  // Add remarks if present
  if (remarks && remarks.trim() !== "") {
    verificationStatus += `<p><strong>Remarks:</strong> ${remarks}</p>`;
  }
  let template = "";
  // Fetch template from database
  const templateOne = await MailTemplate.findOne({
    slug: "employment_verification_status",
    role: "2",
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
    employeeName: employeeName,
    verificationStatus: verificationStatus,
    companyName: companyName,
  };
  let templateDescription = CompanyMailLayout(template.description);
  // Replace placeholders
  return replaceMailPlaceholders(templateDescription, data);

  /*  return GeneralMailLayout(`<p>Dear <strong>${employeeName}</strong>,</p>
        <p>Your employment verification details have been updated by <strong>${companyName}</strong>.</p>
        <p>Here is the status of your verification:</p>
        ${verificationStatus}
        <p>If you believe there is an error, please contact our support team.</p>
        <br/>
        <p>Regards,<br/> Global Employability Information Services India Limited</p>`); */
};
