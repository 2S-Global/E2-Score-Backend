export const companyInterviewInvitationTemplate = (userName, designation, companyName, interviewDateString, formattedInterviewTime, interviewLocation, applicationId, jobId) => {
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
                      Thank you for your interest in the
                      <strong>${designation}</strong> position at
                      <strong>${companyName}</strong>.
                      After reviewing your application and profile, we are pleased to invite you
                      for an interview at our Kolkata office.
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
                      <strong>Location:</strong> ${interviewLocation}
                    </p>

                    <h3 style="margin-top:20px;">Action Required</h3>

                    <p>
                      To finalise the schedule, please confirm your availability by selecting
                      one of the options below.
                    </p>
                  </td>
                </tr>

                <!-- BUTTONS -->
                <tr>
                  <td align="center" style="padding:20px 0;">
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">

                      <tr>
                        <td align="center" style="padding-bottom:10px;">
                          <a href="${process.env.frontend_url}/interview-response?id=${applicationId}&jobId=${jobId}"
                            style="display:block;width:100%;max-width:320px;
                                    background:#28a745;color:#ffffff;
                                    padding:14px 0;text-decoration:none;
                                    border-radius:4px;font-weight:bold;text-align:center;">
                            Confirmation
                          </a>
                        </td>
                      </tr>

                    </table>
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
