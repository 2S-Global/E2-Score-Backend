const escapeHtml = (value = "") =>
  String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });

export const jobInvitationTemplate = ({
  name,
  jobTitle,
  companyName = "GEISIL",
  respondUrl,
}) => `
  <div style="font-family:Arial,sans-serif;color:#252525;max-width:600px;margin:0 auto;padding:24px;line-height:1.6">
    
    <!-- Hero Image with Centered Text Overlay -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:20px; border-collapse:collapse;">
      <tr>
        <td 
          align="center" 
          valign="middle" 
          background="https://res.cloudinary.com/da4unxero/image/upload/v1791972718/jobinvitationEmail_wxx3la.jpg" 
          style="background-image: url('https://res.cloudinary.com/da4unxero/image/upload/v1791972718/jobinvitationEmail_wxx3la.jpg'); background-size: cover; background-position: center; background-repeat: no-repeat; height: 180px; padding: 20px; text-align: center;"
        >
          <!-- Semi-transparent overlay box for readable text -->
          <div>
            <span style="color: #1b4fd1; font-size: 18px; font-weight: bold; text-transform: uppercase;">
              ${escapeHtml(companyName)}
            </span>
          </div>
        </td>
      </tr>
    </table>

    <h2>You are shortlisted</h2>
    <p>Hello ${escapeHtml(name)},</p>
    <p>Congratulations! You have been shortlisted for the position of <strong>${escapeHtml(jobTitle)}</strong>.</p>
    <p>Please update your profile to ensure your information and preferences are accurate. Any preferences not provided will be marked as “Not specified.”</p>
    <p style="margin:28px 0">
      <a href="${escapeHtml(respondUrl)}&amp;decision=Accepted" style="display:inline-block;background:#18794e;color:#fff;text-decoration:none;padding:12px 22px;margin-right:10px">Update Profile</a>
    </p>
    <p>This invitation link expires in 7 days.</p>
    <p>Regards,<br />${escapeHtml(companyName)}</p>
    <div style="text-align: center; margin-top: 30px;">
      <img src="https://res.cloudinary.com/da4unxero/image/upload/v1746776002/QuikChek%20images/ntvxq8yy2l9de25t1rmu.png" alt="Footer" style="width:97px; height: 116px;" />
    </div>
  </div>
`;
