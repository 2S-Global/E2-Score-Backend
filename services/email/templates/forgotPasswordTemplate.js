import { GeneralMailLayout } from "../../../utility/MailTeamplates.js";
export const forgotPasswordTemplate = (name, newPassword) =>
  GeneralMailLayout(`

              <h3>Dear ${name},</h3>
              <p>Your password has been successfully reset as per your request. Please find your new login credentials below:</p>
              <p><strong>New Password:</strong> ${newPassword}</p>
              <p>For your security, we strongly recommend that you log in immediately and change this password to something more personal and secure.</p>
              <p>
              If you did not request this password reset or have any concerns, please contact our support team right away.
              
              
              </p>
              <br/>
              <p>Stay secure,<br/>Global Employability Information Services India Limited</p>
          `);
