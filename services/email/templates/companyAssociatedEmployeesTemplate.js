export const companyAssociatedEmployeesTemplate = (employeeListHtml) => `
  <div style="max-width:600px; margin:auto; font-family:Arial, sans-serif; background:#f4f6f9; padding:20px;">
    <h2 style="color:#333; text-align:center;">Employees Associated with Your Company</h2>
    <p style="color:#555; text-align:center;">Here are the employees currently linked with your company record:</p>
    ${employeeListHtml}
    <p style="margin-top:20px; font-size:12px; color:#999; text-align:center;">
      If you think some information is incorrect, please contact support.
    </p>
  </div>
`;
