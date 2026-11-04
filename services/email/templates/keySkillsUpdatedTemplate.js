import { GeneralMailLayout } from "../../../utility/MailTeamplates.js";
export const keySkillsUpdatedTemplate = (user) =>
  GeneralMailLayout(`
      <div style="font-family: Arial, sans-serif;  padding:20px; line-height:1.6; max-width:600px; margin:auto;  border-radius:8px;">
        

        <div style=" padding:15px 20px;">
          <strong>Key Skill List Update Notification</strong>
        </div>

        <div style="padding:20px; background:#fff;">
          <p>Dear <strong>${user.name}</strong>,</p>

          <p>Your <strong>Key Skill List</strong> has been successfully updated.</p>

          <p>If you did not make this change, please contact our support team immediately.</p>

          <p>
            <a href="${process.env.ORIGIN}"
               style="background:#0052cc;color:#fff;padding:10px 16px;text-decoration:none;border-radius:5px;display:inline-block;">
              Visit Dashboard
            </a>
          </p>

          <p>Or visit:</p>

          <p>
            <a href="${process.env.ORIGIN}">
              ${process.env.ORIGIN}
            </a>
          </p>

          <br>

          <p>
            Sincerely,<br>
            Global Employability Information Services India Limited
          </p>
        </div>
      </div>
`);
