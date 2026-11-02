import {
  replaceMailPlaceholders,
  CompanyMailLayout,
} from "../../../utility/MailTeamplates.js";
import {
  CompanyMailTemplate,
  MailTemplate,
} from "../../../models/company_Models/MailTemplatesModel.js";
export const companyInterviewRescheduledTemplate = async (
  userName,
  designation,
  companyName,
  interviewDateString,
  formattedInterviewTime,
  interviewLocation,
  loginId,
) => {
  let template = "";
  // Fetch template from database
  const templateOne = await MailTemplate.findOne({
    slug: "interview_rescheduled",
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
    designation: designation,
    companyName: companyName,
    interviewDate: interviewDateString,
    interviewTime: formattedInterviewTime,
    interviewLocation: interviewLocation,
  };
  let templateDescription = CompanyMailLayout(template.description);
  // Replace placeholders
  return replaceMailPlaceholders(templateDescription, data);

  /*  
    `
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
              style="font-family:Arial,Helvetica,sans-serif;padding:20px;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
                    style="max-width:600px;padding:24px;border-radius:6px;color:#333;">

                <tr>
                  <td>
                    <p>Dear ${userName || "Candidate"},</p>

                    <p>
                      We would like to inform you that your interview for the position of
                      <strong>${designation}</strong> at <strong>${companyName}</strong>
                      has been <strong>rescheduled</strong>.
                    </p>

                    <p>
                      This interview will be an opportunity for us to discuss your technical
                      expertise in greater detail and for you to learn more about our team
                      and the exciting projects we are currently driving.
                    </p>

                    <h3 style="margin-top:20px;">Interview Details</h3>

                    <p>
                      <strong>Date:</strong> ${interviewDateString}<br />
                      <strong>Time:</strong> ${formattedInterviewTime}<br />
                      <strong>Location:</strong> ${interviewLocation}<br />
                    </p>

                  </td>
                </tr>

                <tr>
                  <td>
                    <p>
                      Please remember to carry a physical copy of your updated resume
                      and a valid photo ID.
                    </p>

                    <p>
                      We look forward to meeting you and exploring the possibility of
                      you joining our technical team.
                    </p>

                    <p style="margin-top:24px;">
                      Thanks &amp; Regards,<br />
                      <strong>Hiring Team</strong><br />
                      ${companyName}
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      ` */
};
