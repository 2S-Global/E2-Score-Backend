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
    <div style="position:relative;margin-bottom:20px;text-align:center;overflow:hidden">
      <img src="${escapeHtml(process.env.EMAIL_HEADER_LOGO_URL || "https://services.geisil.com/assets/Logo-D7c9kIlT.webp")}" alt="" style="display:block;width:100%;height:auto" />
      <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(0,0,0,.42);color:#fff;font-size:24px;font-weight:bold;text-shadow:0 1px 3px #000">
        ${escapeHtml(companyName)}
      </div>
    </div>
    <h2>You're invited to apply</h2>
    <p>Hello ${escapeHtml(name)},</p>
    <p>You have been invited to apply for <strong>${escapeHtml(jobTitle)}</strong>.</p>
    <p>Accepting submits your application. Preferences not provided will be marked “Not specified.”</p>
    <p style="margin:28px 0">
      <a href="${escapeHtml(respondUrl)}&amp;decision=Accepted" style="display:inline-block;background:#18794e;color:#fff;text-decoration:none;padding:12px 22px;margin-right:10px">Profile Update</a>
      /* <a href="${escapeHtml(respondUrl)}&amp;decision=Rejected" style="display:inline-block;background:#555;color:#fff;text-decoration:none;padding:12px 22px">Reject</a> */
    </p>
    <p>This invitation link expires in 7 days.</p>
    <p>Regards,<br />GEISIL</p>
    <div style="text-align: center; margin-top: 30px;">
      <img src="https://res.cloudinary.com/da4unxero/image/upload/v1746776002/QuikChek%20images/ntvxq8yy2l9de25t1rmu.png" alt="Footer" style="width:97px; height: 116px;" />
    </div>
  </div>
`;
