import { GeneralMailLayout } from "../../../utility/MailTeamplates.js";
export const itskillAddedTemplate = (user) =>
  GeneralMailLayout(`
      <div style="font-family: Arial, sans-serif; color:#333; padding:20px; line-height:1.6; max-width:600px; margin:auto;border-radius:8px;">
        

        <div style="padding:15px 20px;">
          <strong>
            Itskill List Update Notification
          </strong>
        </div>

        <div style="padding:20px; background:#fff;">
          <p>Dear <strong>${user.name}</strong>,</p>

          <p>
            New Itskill details have been <strong>added</strong> to your profile.
          </p>

          <p>
            If you did not make this change, please contact support immediately.
          </p>

          <p>
            <a href="${process.env.ORIGIN}"
               style="background:#0052cc;color:#fff;padding:10px 16px;text-decoration:none;border-radius:5px;">
               Visit Dashboard
            </a>
          </p>

          <p>
            <a href="${process.env.ORIGIN}">
              ${process.env.ORIGIN}
            </a>
          </p>

          <br />

          <p>
            Sincerely,<br />
           Global Employability Information Services India Limited
          </p>
        </div>
      </div>
`);
