export const instituteAcademicVerificationStatusTemplate = (userName, instituteName, levelVerified, courseTypeVerified, courseNameVerified, durationVerified, gradingSystemVerified, marksVerified, remarks) => {
  const verificationStatus = `
        <ul>
          <li><strong>Level:</strong> ${levelVerified ? "Verified" : "Not Verified"}</li>
          <li><strong>Course Type:</strong> ${courseTypeVerified ? "Verified" : "Not Verified"}</li>
          <li><strong>Course Name:</strong> ${courseNameVerified ? "Verified" : "Not Verified"}</li>
          <li><strong>Duration:</strong> ${durationVerified ? "Verified" : "Not Verified"}</li>
          <li><strong>Grading System:</strong> ${gradingSystemVerified ? "Verified" : "Not Verified"}</li>
          <li><strong>Marks:</strong> ${marksVerified ? "Verified" : "Not Verified"}</li>
          <li><strong>Remarks:</strong> ${remarks || ""}</li>
        </ul>
      `;

  return `<p>Dear <strong>${userName}</strong>,</p>
        <p>Your academic verification details have been updated by <strong>${instituteName}</strong>.</p>
        <p>Here is the status of your verification:</p>
        ${verificationStatus}
        <p>If you believe there is an error, please contact our support team.</p>
        <br/>
        <p>Regards,<br/>E2Score Verification Team</p>`;
};
