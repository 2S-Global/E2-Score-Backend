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

export const jobInvitationTemplate = ({ name, jobTitle, respondUrl }) => `
  <div style="font-family:Arial,sans-serif;color:#252525;max-width:600px;margin:0 auto;padding:24px;line-height:1.6">
  <div style="text-align: center; margin-bottom: 20px;">
    <img src="${process.env.EMAIL_HEADER_LOGO_URL || "https://services.geisil.com/assets/Logo-D7c9kIlT.webp"}" alt="Banner" style="width: 100%; height: auto;" />
  </div>
    <h2>You're invited to apply</h2>
    <p>Hello ${escapeHtml(name)},</p>
    <p>You have been invited to apply for <strong>${escapeHtml(jobTitle)}</strong>.</p>
    <p>Accepting submits your application. Preferences not provided will be marked “Not specified.”</p>
    <p style="margin:28px 0">
      <a href="${escapeHtml(respondUrl)}&amp;decision=Accepted" style="display:inline-block;background:#18794e;color:#fff;text-decoration:none;padding:12px 22px;margin-right:10px">Accept</a>
      <a href="${escapeHtml(respondUrl)}&amp;decision=Rejected" style="display:inline-block;background:#555;color:#fff;text-decoration:none;padding:12px 22px">Reject</a>
    </p>
    <p>For security, you'll confirm your selection after opening the link. This invitation link expires in 7 days.</p>
    <p>Regards,<br />GEISIL</p>
    <div style="text-align: center; margin-top: 30px;">
      <img src="https://res.cloudinary.com/da4unxero/image/upload/v1746776002/QuikChek%20images/ntvxq8yy2l9de25t1rmu.png" alt="Footer" style="width:97px; height: 116px;" />
    </div>
  </div>
`;
