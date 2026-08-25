export const companyInterviewRescheduledTemplate = (userName, designation, companyName, interviewDateString, formattedInterviewTime, interviewLocation) => {
  return `
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${process.env.EMAIL_HEADER_LOGO_URL || "https://services.geisil.com/assets/Logo-D7c9kIlT.webp"}" alt="Banner" style="width: 100%; height: auto;" />
        </div>

        <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
              style="font-family:Arial,Helvetica,sans-serif;background-color:#f4f4f4;padding:20px;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
                    style="max-width:600px;background:#ffffff;padding:24px;border-radius:6px;color:#333;">

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
      `;
};
