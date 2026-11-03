import { GeneralMailLayout } from "../../../utility/MailTeamplates.js";
export const companyPackageActivationTemplate = (
  companyName,
  planDetailsHtml,
  discount,
) =>
  GeneralMailLayout(`
      
      
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <p>Dear ${companyName || "Valued Partner"},</p>

          <p>Greetings from Global Employability Information Services India Limited.</p>

          <p>Following the successful creation of your <strong>QuikChek</strong> account, we are pleased to inform you that your selected service package has been activated.</p>

          <p>Based on your industry segment and requirements, the following package is now active for your account:</p>

          ${planDetailsHtml}
        ${
          discount > 0
            ? `<p><strong>• Discount Applied:</strong> ${discount}%</p>`
            : ""
        }
          <p>With this activated package, you can now begin utilizing QuikChek's fast and accurate KYC verification services.</p>

          <p>To access the platform and begin your verifications, please log in using your credentials at: <a href="https://www.quikchek.in">www.quikchek.in</a></p>

          <p>We are committed to providing you with a seamless and efficient KYC verification experience. If you have any questions about your activated package or require any assistance, please feel free to contact our support team:</p>

          <ul>
            <li><strong>Email:</strong> hello@geisil.com</li>
            <li><strong>Phone:</strong> 9831823898</li>
          </ul>

          <p>Thank you for choosing Global Employability Information Services India Limited.</p>

          <p>Sincerely,<br/>Global Employability Information Services India Limited</p>

          
        </div>
`);
