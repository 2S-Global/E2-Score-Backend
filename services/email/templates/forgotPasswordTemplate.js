export const forgotPasswordTemplate = (name, newPassword) => `
<div style="text-align: center; margin-bottom: 20px;">
    <img src="${process.env.EMAIL_HEADER_LOGO_URL || "https://services.geisil.com/assets/Logo-D7c9kIlT.webp"}" alt="Banner" style="width: 100%; height: auto;" />
  </div>
              <h3>Dear ${name},</h3>
              <p>Your password has been successfully reset as per your request. Please find your new login credentials below:</p>
              <p><strong>New Password:</strong> ${newPassword}</p>
              <p>For your security, we strongly recommend that you log in immediately and change this password to something more personal and secure.</p>
              <p>
              If you did not request this password reset or have any concerns, please contact our support team right away.
              
              
              </p>
              <br/>
              <p>Stay secure,<br/>E2Score Team</p>
          `;
