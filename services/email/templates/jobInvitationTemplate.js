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
    
    <!-- Full Responsive Image (Guarantees the entire image shows on mobile) -->
    <div style="margin-bottom:0;text-align:center;">
      <img src="https://res.cloudinary.com/da4unxero/image/upload/v1791972718/jobinvitationEmail_wxx3la.jpg" alt="${escapeHtml(companyName)}" style="display:block;width:100%;height:auto;border:0;" />
    </div>

    <!-- Centered Company Name Bar -->
    <div style="background-color:#f4f4f4;padding:12px;text-align:center;margin-bottom:24px;">
      <span style="color: #1b4fd1; font-size: 18px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">
        ${escapeHtml(companyName)}
      </span>
    </div>

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
