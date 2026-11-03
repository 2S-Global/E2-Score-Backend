import { GeneralMailLayout } from "../../../utility/MailTeamplates.js";
export const companyPackageActivationResendTemplate = (
  companyName,
  planDetailsHtml,
  discount,
) =>
  GeneralMailLayout(`
        

        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <p>Dear ${companyName || "Valued Partner"},</p>

          <p>Greetings from Global Employability Information Services India Limited.</p>

          <p>This is a follow-up email to confirm your <strong>QuikChek</strong> service package.</p>

          <p>Your active service package details:</p>
          ${planDetailsHtml}
          ${
            discount > 0
              ? `<p><strong>• Discount Applied:</strong> ${discount}%</p>`
              : ""
          }

          <p>Start using your services at: <a href="https://www.quikchek.in">www.quikchek.in</a></p>

          <p>Need help? Contact our support:</p>
          <ul>
            <li><strong>Email:</strong> hello@geisil.com</li>
            <li><strong>Phone:</strong> 9831823898</li>
          </ul>

          <p>Thank you for choosing Global Employability Information Services India Limited.</p>

          <p>Sincerely,<br/>The Admin Team<br/>Global Employability Information Services India Limited</p>
        </div>
`);
