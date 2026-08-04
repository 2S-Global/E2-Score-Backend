export const applicationShortlistedTemplate = (user, designation, companyName) => `
  <div style="font-family: Arial, sans-serif; color:#333; padding:20px; line-height:1.6; max-width:600px; margin:auto; background:#f9f9f9; border-radius:8px;">
    
    <div style="background:#0052cc; padding:15px 20px; border-radius:8px 8px 0 0;">
      <h2 style="color:#fff; margin:0; font-size:20px;">Application Shortlisted</h2>
    </div>

    <div style="padding:20px; background:#ffffff; border-radius:0 0 8px 8px;">
      <p>Dear <strong>${user.name || "Candidate"}</strong>,</p>
          
      <p>
        We are pleased to inform you that you have been
        <strong>shortlisted</strong> for the next stage of our recruitment process
        for the position of <strong>${designation}</strong> at
        <strong>${companyName}</strong>.
      </p>

      <p>Our team will reach out to you shortly with further details.</p>

      <br />
      <p>Best regards,</p>
      <p><strong>HR Team</strong></p>
    </div>
  </div>
`;
