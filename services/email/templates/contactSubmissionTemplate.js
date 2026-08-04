export const contactSubmissionTemplate = (name, email, subject, message, dispute) => {
    return dispute
      ? `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: #dc2626; color: white; padding: 16px; text-align: center;">
          <h2 style="margin: 0; font-size: 20px;">⚠️ New Dispute Submission</h2>
        </div>
        <!-- Body -->
        <div style="padding: 20px; background: #fff5f5;">
          <p style="font-size: 16px; margin-bottom: 16px; color: #333;">
            A user has submitted a dispute form. Please review the details below carefully:
          </p>
          <table style="width: 100%; border-collapse: collapse; font-size: 15px;">
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; width: 30%;">👤 Name</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">📧 Email</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${email}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">📝 Subject</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${subject}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; vertical-align: top;">💬 Dispute Details</td>
              <td style="padding: 10px; border: 1px solid #ddd; white-space: pre-wrap;">${message}</td>
            </tr>
          </table>
        </div>
        <!-- Footer -->
        <div style="background: #fee2e2; padding: 14px; text-align: center; font-size: 13px; color: #555;">
          <p style="margin: 0;">This email was generated automatically by Quikchek’s <strong>Dispute Form</strong>.</p>
          <p style="margin: 4px 0 0;">&copy; ${new Date().getFullYear()} Quikchek</p>
        </div>
      </div>
      `
      : `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: #4f46e5; color: white; padding: 16px; text-align: center;">
          <h2 style="margin: 0; font-size: 20px;">📩 New Contact Submission</h2>
        </div>
        <!-- Body -->
        <div style="padding: 20px; background: #fafafa;">
          <p style="font-size: 16px; margin-bottom: 16px; color: #333;">
            You’ve received a new contact form submission. Here are the details:
          </p>
          <table style="width: 100%; border-collapse: collapse; font-size: 15px;">
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; width: 30%;">👤 Name</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">📧 Email</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${email}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">📝 Subject</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${subject}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; vertical-align: top;">💬 Message</td>
              <td style="padding: 10px; border: 1px solid #ddd; white-space: pre-wrap;">${message}</td>
            </tr>
          </table>
        </div>
        <!-- Footer -->
        <div style="background: #f3f4f6; padding: 14px; text-align: center; font-size: 13px; color: #555;">
          <p style="margin: 0;">This email was generated automatically by Quikchek’s <strong>Contact Form</strong>.</p>
          <p style="margin: 4px 0 0;">&copy; ${new Date().getFullYear()} Quikchek</p>
        </div>
      </div>
      `;
};
