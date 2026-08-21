export const profileSummaryDeletedTemplate = (user) => `
  <div style="font-family: Arial, sans-serif; color:#333; padding:20px; line-height:1.6; max-width:600px; margin:auto; background:#f9f9f9; border-radius:8px;">
     <div>
      <img src="${process.env.EMAIL_HEADER_LOGO_URL || "https://services.geisil.com/assets/Logo-D7c9kIlT.webp"}"
           alt="GEISIL Banner" 
           style="width:100%; border-radius:8px 8px 0 0; display:block;" />
    </div>
    <div style="background:#0052cc; padding:15px 20px; border-radius:8px 8px 0 0;">
      <h2 style="color:#fff; margin:0; font-size:20px;">Profile Summary Update Notification</h2>
    </div>

    <div style="padding:20px; background:#ffffff; border-radius:0 0 8px 8px;">
      <p>Dear <strong>${user.name}</strong>,</p>

      <p>We are writing to inform you that your <strong>Profile Summary</strong> has been successfully deleted from your GEISIL account.</p>

      <p>If you did not make this change or believe this action is unauthorized, please contact our support team immediately.</p>

      <p>You can visit your dashboard anytime by clicking the link below:</p>

      <p>
        <a href="${process.env.ORIGIN}" 
           style="background:#0052cc; color:#fff; padding:10px 16px; text-decoration:none; border-radius:5px; display:inline-block;">
          Visit Dashboard
        </a>
      </p>

      <p>If the button above does not work, copy and paste the following URL into your browser:</p>
      <p><a href="${process.env.ORIGIN}" style="color:#0052cc;">${process.env.ORIGIN}</a></p>

      <br />

      <p>Sincerely,<br />
      <strong>Admin Team</strong><br />
      Global Employability Information Services India Limited</p>

    </div>
  </div>
`;
