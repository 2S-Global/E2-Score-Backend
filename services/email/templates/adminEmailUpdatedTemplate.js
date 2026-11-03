import { GeneralMailLayout } from "../../../utility/MailTeamplates.js";
export const adminEmailUpdatedTemplate = (name, email) =>
  GeneralMailLayout(`
      
          <p>Dear <strong>${name}</strong>,</p>
          <p>We wanted to let you know that the email address associated with your account was recently changed.</p>

            <p><strong>New Email Address::</strong> ${email}</p>
        
          <p>If you made this change, no further action is needed.</p>
        
          <p>If you didn’t make this change or believe it was done in error, please contact our support team immediately so we can help secure your account.</p>
          <br />
          <p>Sincerely,<br />
          Global Employability Information Services India Limited</p>
`);
