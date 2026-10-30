export const replaceMailPlaceholders = (template, data = {}) => {
  if (typeof template !== "string") {
    return "";
  }
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    const value = data[key];
    return value !== undefined && value !== null ? String(value) : match;
  });
};

export const CompanyMailLayout = (template) => {
  return `<!DOCTYPE html>
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
          alt={companyName}
          style="display: block; width: 100%; max-width: 100%; height: auto; border: 0;" 
        />
      </div>

      <!-- Centered Company Name Bar -->
      <div style="background-color: #ffffff; padding: 14px 20px; text-align: center; border-bottom: 1px solid #e2e8f0;">
        <span style="color: #0f172a; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; display: inline-block;">
         {companyName}
        </span>
      </div>

      <!-- Main Content Body -->
      <div style="padding: 28px 20px; color: #334155; line-height: 1.6; font-size: 15px;">
        ${template}
      </div>

      <!-- Footer Section -->
      <div style="padding: 24px 20px; text-align: center; background-color: #f8fafc; border-top: 1px solid #e2e8f0;">
        <!-- Footer Logo -->
        <div style="margin-bottom: 12px;">
          <img src="https://res.cloudinary.com/da4unxero/image/upload/v1746776002/QuikChek%20images/ntvxq8yy2l9de25t1rmu.png" alt="Footer Logo" style="display: inline-block; border: 0; width: 65px; height: auto;" />
        </div>
      </div>

    </div>
  </div>
</body>
</html>`;
};
