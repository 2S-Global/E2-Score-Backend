import {
  replaceMailPlaceholders,
  CompanyMailLayout,
} from "../../../utility/MailTeamplates.js";
import {
  CompanyMailTemplate,
  MailTemplate,
} from "../../../models/company_Models/MailTemplatesModel.js";
export const companyOfferLetterTemplate = async (
  userName,
  offer_letter_designation,
  companyName,
  offer_letter_joining_date_string,
  offer_letter_salary,
  offer_letter_message,
  loginId,
) => {
  let template = "";
  // Fetch template from database
  const templateOne = await MailTemplate.findOne({
    slug: "offer_letter",
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
    candidateName: userName,
    designation: offer_letter_designation,
    companyName: companyName,
    joiningDate: offer_letter_joining_date_string,
    salary: offer_letter_salary,
    message: offer_letter_message,
  };
  let templateDescription = CompanyMailLayout(template.description);
  // Replace placeholders
  return replaceMailPlaceholders(templateDescription, data);

  /* return GeneralMailLayout(`
        
 
        <p>Dear ${userName || "Candidate"},</p>

        <p>
          We are pleased to extend an offer of employment to you for the position of
          <strong>${offer_letter_designation}</strong> at <strong>${companyName}</strong>.
        </p>

        <p>
          <strong>Offer Details:</strong><br />
          <strong>Designation:</strong> ${offer_letter_designation}<br />
          <strong>Proposed Joining Date:</strong> ${offer_letter_joining_date_string}<br />
          <strong>Salary:</strong> ₹${offer_letter_salary}
        </p>

        ${offer_letter_message ? `<p>${offer_letter_message}</p>` : ""}

        <br />
        <p>Best regards,</p>
        <p><strong>HR Team</strong></p>
        <p>${companyName}</p>
      `); */
};
