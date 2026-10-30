const escapeHtml = (value = "") =>
  String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });

export const jobInvitationTemplate = ({
  name,
  jobTitle,
  companyName = "GEISIL",
  respondUrl,
  htmlContent = "",
}) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Job Invitation</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  
  <!-- Outer Centered Wrapper -->
  <div style="background-color: #f8fafc; padding: 16px 8px; width: 100%; box-sizing: border-box; min-height: 100vh;">
    
    <!-- Main Email Card -->
    <div style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0; width: 100%; box-sizing: border-box;">
      
      <!-- Top Banner Image Block (Fully Responsive) -->
      <div style="width: 100%; background-color: #ffffff; line-height: 0; text-align: center;">
        <img 
          src="https://res.cloudinary.com/da4unxero/image/upload/v1791972718/jobinvitationEmail_wxx3la.jpg" 
          alt="${escapeHtml(companyName)}" 
          style="display: block; width: 100%; max-width: 100%; height: auto; border: 0;" 
        />
      </div>

      <!-- Centered Company Name Bar -->
      <div style="background-color: #ffffff; padding: 14px 20px; text-align: center; border-bottom: 1px solid #e2e8f0;">
        <span style="color: #0f172a; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; display: inline-block;">
          ${escapeHtml(companyName)}
        </span>
      </div>

      <!-- Main Content Body -->
      <div style="padding: 28px 20px; color: #334155; line-height: 1.6; font-size: 15px;">
        
        <div style="margin-bottom: 16px; font-size: 16px; color: #0f172a;">
          Hello <strong style="color: #0f172a;">${escapeHtml(name)}</strong>,
        </div>
        
        <div style="margin-bottom: 20px; color: #334155;">
          Congratulations! You have been shortlisted for the position of <strong style="color: #0f172a;">${escapeHtml(jobTitle)}</strong>.
        </div>
        
        <!-- Custom htmlContent -->
        ${htmlContent ? `<div style="margin-bottom: 24px; color: #475569;">${htmlContent}</div>` : ""}
        
        <!-- Call to Action Button Wrapper -->
        <div style="margin: 32px 0; text-align: left;">
          <a href="${escapeHtml(respondUrl)}&amp;decision=Accepted" target="_blank" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 28px; font-size: 15px; font-weight: 600; border-radius: 6px; letter-spacing: 0.3px; box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);">Update Profile</a>
        </div>

        <div style="margin-bottom: 24px; font-size: 13px; color: #64748b;">
          This invitation link expires in 7 days.
        </div>
        
        <div style="margin-top: 28px; border-top: 1px solid #f1f5f9; padding-top: 20px; font-size: 14px; color: #475569;">
          Regards,<br />
          <strong style="color: #0f172a;">${escapeHtml(companyName)}</strong>
        </div>
      </div>

      <!-- Footer Section -->
      <div style="padding: 24px 20px; text-align: center; background-color: #f8fafc; border-top: 1px solid #e2e8f0;">
        <!-- Footer Logo -->
        <div style="margin-bottom: 12px;">
          <img src="https://res.cloudinary.com/da4unxero/image/upload/v1746776002/QuikChek%20images/ntvxq8yy2l9de25t1rmu.png" alt="Footer Logo" style="display: inline-block; border: 0; width: 65px; height: auto;" />
        </div>
        <!-- Copyright & Company Info -->
        <div style="font-size: 12px; color: #94a3b8; line-height: 1.5;">
          &copy; ${new Date().getFullYear()} ${escapeHtml(companyName)}. All rights reserved.<br />
          You received this email because you applied for a job through our platform.
        </div>
      </div>

    </div>
  </div>
</body>
</html>
`;
