export const companyPackageActivationTemplate = (companyName, planDetailsHtml, discount) => `
      <div style="text-align: center; margin-bottom: 20px;">
    <img src="${process.env.EMAIL_HEADER_LOGO_URL || "https://services.geisil.com/assets/Logo-D7c9kIlT.webp"}" alt="Banner" style="width: 100%; height: auto;" />
      </div>
      
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <p>Dear ${companyName || "Valued Partner"},</p>

          <p>Greetings from <strong>Global Employability Information Services India Limited</strong>.</p>

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

          <p>Thank you for choosing <strong>Global Employability Information Services India Limited</strong>.</p>

          <p>Sincerely,<br/>The Admin Team<br/><strong>Global Employability Information Services India Limited</strong></p>

           <div style="text-align: center; margin-top: 30px;">
      <img src="https://res.cloudinary.com/da4unxero/image/upload/v1746776002/QuikChek%20images/ntvxq8yy2l9de25t1rmu.png" alt="Footer" style="width:97px; height: 116px;" />
    </div>
        </div>
`;
