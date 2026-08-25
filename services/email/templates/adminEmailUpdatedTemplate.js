export const adminEmailUpdatedTemplate = (name, email) => `
        <div style="text-align: center; margin-bottom: 20px;">
      <img src="${process.env.EMAIL_HEADER_LOGO_URL || "https://services.geisil.com/assets/Logo-D7c9kIlT.webp"}" alt="Banner" style="width: 100%; height: auto;" />
    </div>
          <p>Dear <strong>${name}</strong>,</p>
          <p>We wanted to let you know that the email address associated with your account was recently changed.</p>

            <p><strong>New Email Address::</strong> ${email}</p>
        
          <p>If you made this change, no further action is needed.</p>
        
          <p>If you didn’t make this change or believe it was done in error, please contact our support team immediately so we can help secure your account.</p>
          <br />
          <p>Sincerely,<br />
          The Admin Team<br />
          <strong>E2Score India Limited</strong></p>
`;
