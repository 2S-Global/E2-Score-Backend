const employeeCardHtml = (newEmployeeUser, job_title) => `
      <div style="display:flex; align-items:center; border:1px solid #ddd; border-radius:8px; padding:12px; margin-bottom:12px; background:#fff; font-family:Arial, sans-serif;">
        <img src="${newEmployeeUser.profilePicture || "https://via.placeholder.com/50"
    }" 
             alt="profile" 
             style="width:50px; height:50px; border-radius:6px; object-fit:cover; margin-right:12px; border:1px solid #ccc;" />
        <div>
          <h3 style="margin:0; font-size:16px; color:#0073b1;">${newEmployeeUser.name || "N/A"
    }</h3>
          <p style="margin:4px 0 0 0; font-size:14px; font-weight:bold; color:#333;">${job_title || "Unknown"
    }</p>
          <p style="margin:2px 0; font-size:13px; color:#555;">${newEmployeeUser.email || ""
    }</p>
        </div>
      </div>
    `;

export const htmlTemplate = (newEmployeeUser, job_title) => `
      <div style="max-width:600px; margin:auto; font-family:Arial, sans-serif; background:#f4f6f9; padding:20px;">
        <h2 style="color:#333; text-align:center;">New Employee Associated with Your Company</h2>
        <p style="color:#555; text-align:center;">A new employee has added your company in their employment details:</p>
        ${employeeCardHtml(newEmployeeUser, job_title)}
        <p style="margin-top:20px; font-size:12px; color:#999; text-align:center;">
          If you think some information is incorrect, please contact support.
        </p>
      </div>
    `;