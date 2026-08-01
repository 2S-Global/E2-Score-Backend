export const keySkillsUpdatedTemplate = (user) => `
      <div style="font-family: Arial, sans-serif; color:#333; padding:20px; line-height:1.6; max-width:600px; margin:auto; background:#f9f9f9; border-radius:8px;">
        <div>
          <img src="${process.env.CLIENT_BASE_URL_TEMP}/images/emailheader/changekeyskill.png"
               alt="GEISIL Banner"
               style="width:100%; border-radius:8px 8px 0 0; display:block;" />
        </div>

        <div style="background:#0052cc; padding:15px 20px;">
          <h2 style="color:#fff; margin:0;">Key Skill List Update Notification</h2>
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
            <strong>Admin Team</strong><br>
            Global Employability Information Services India Limited
          </p>
        </div>
      </div>
`;
