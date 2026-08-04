export const companyEmploymentVerificationStatusTemplate = (employeeName, companyName, workedInCompanyBool, VerifiedBool, designationVerifiedBool, durationVerifiedBool, employmentTypeVerifiedBool, remarks) => {
  let verificationStatus = `
      <ul>
        <li>Worked in Company: <strong>${
          workedInCompanyBool ? "✅ Yes" : "❌ No"
        }</strong></li>
        <li>Overall Employment Verified: <strong>${
          VerifiedBool ? "✅ Yes" : "❌ No"
        }</strong></li>
        <li>Designation Verified: <strong>${
          designationVerifiedBool ? "✅ Yes" : "❌ No"
        }</strong></li>
        <li>Duration Verified: <strong>${
          durationVerifiedBool ? "✅ Yes" : "❌ No"
        }</strong></li>
        <li>Employment Type Verified: <strong>${
          employmentTypeVerifiedBool ? "✅ Yes" : "❌ No"
        }</strong></li>
      </ul>
    `;

  // Add remarks if present
  if (remarks && remarks.trim() !== "") {
    verificationStatus += `<p><strong>Remarks:</strong> ${remarks}</p>`;
  }

  return `<p>Dear <strong>${employeeName}</strong>,</p>
        <p>Your employment verification details have been updated by <strong>${companyName}</strong>.</p>
        <p>Here is the status of your verification:</p>
        \${verificationStatus}
        <p>If you believe there is an error, please contact our support team.</p>
        <br/>
        <p>Regards,<br/>E2Score Verification Team</p>`;
};
