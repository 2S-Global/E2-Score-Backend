export const certificateAddedTemplate = (user) => `
  <div style="font-family: Arial, sans-serif; color:#333; padding:20px; line-height:1.6; max-width:600px; margin:auto; background:#f9f9f9; border-radius:8px;">
     <div>
        <img src="${process.env.CLIENT_BASE_URL_TEMP}/images/emailheader/addcertification.png"
             alt="GEISIL Banner" 
             style="width:100%; border-radius:8px 8px 0 0; display:block;" />
     </div>  
    <div style="background:#0052cc; padding:15px 20px; border-radius:8px 8px 0 0;">
      <h2 style="color:#fff; margin:0; font-size:20px;"> Certification Update Notification</h2>
    </div>

    <div style="padding:20px; background:#ffffff; border-radius:0 0 8px 8px;">
      <p>Dear <strong>${user.name}</strong>,</p>
          
       <p>New Certification details have been <strong>added</strong> to your profile.</p>
            
      <p>If you did not make this change, please contact support immediately.</p>

      <p>You can access your dashboard using the link below:</p>

      <p>
        <a href="${process.env.ORIGIN}" 
          style="background:#0052cc; color:#fff; padding:10px 16px; text-decoration:none; border-radius:5px; display:inline-block;">
          Visit Dashboard
        </a>
      </p>

      <p>If the button does not work, use this link:</p>
      <p><a href="${process.env.ORIGIN}" style="color:#0052cc;">${process.env.ORIGIN}</a></p>

      <br />

      <p>Sincerely,<br />
      <strong>Admin Team</strong><br/>
      Global Employability Information Services India Limited</p>
    </div>
  </div>
`;
