export const adminE2scoreCredentialsTemplate = (name, email, password) => `
      <div style="text-align: center; margin-bottom: 20px;">
    <img src="${process.env.EMAIL_HEADER_LOGO_URL || "https://services.geisil.com/assets/Logo-D7c9kIlT.webp"}" alt="Banner" style="width: 100%; height: auto;" />
  </div>
        <p>Dear <strong>${name}</strong>,</p>
        <p>Greetings from <strong>Global Employability Information Services India Limited</strong>.</p>
        <p>
          We are pleased to provide you with access to our newly launched platform,
          <a href="https://www.quikchek.in" target="_blank">https://www.quikchek.in</a>,
          designed for fast and accurate verification of KYC documents. This platform will
          streamline your verification processes, enhance efficiency, and ensure compliance.
        </p>
      
        <p>Your corporate account has been successfully created with the following credentials:</p>
        <ul>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Password:</strong> ${password}</li>
        </ul>
      
        <p>
          Please log in to the platform at 
          <a href="https://www.e2score.in" target="_blank">https://www.e2score.in</a> 
          using the provided credentials. We strongly recommend that you change your password
          upon your first login for security reasons.
        </p>
      
        <p><strong>Key Features and Benefits of E2Score:</strong></p>
        <ul>
          <li>Rapid Verification: Significantly reduced turnaround times for KYC document verification.</li>
          <li>Enhanced Accuracy: Advanced technology minimizes errors and ensures reliable results.</li>
          <li>Secure Platform: Built with robust security measures to protect sensitive data.</li>
          <li>Comprehensive Coverage: Supports a wide range of KYC documents.</li>
          <li>User-Friendly Interface: Intuitive design for a smooth verification experience.</li>
          <li>Audit Trail: Complete record of all verification activity.</li>
        </ul>
      
        <p>We are confident that E2Score will significantly improve your KYC verification workflow.</p>
      
        <p>For any assistance with the platform, including login issues or technical support, please contact our support team at: </p>
        <ul>
          <li><strong>Email:</strong> <a href="mailto:info@geisil.com">info@geisil.com</a></li>
          <li><strong>Phone:</strong> 9831823898</li>
        </ul>
      
        <p>Thank you for choosing <strong>E2Score India Limited</strong>.</p>
        <p>We look forward to supporting your KYC verification needs.</p>
      
        <br />
        <p>Sincerely,<br />
        The Admin Team<br />
        <strong>E2Score India Limited</strong></p>
`;
