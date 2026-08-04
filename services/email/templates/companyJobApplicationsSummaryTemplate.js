export const companyJobApplicationsSummaryTemplate = (jobTitle, totalApplications, applicantsHtml) => {
  return `
      <h2>Job Applications Summary</h2>
      <p><strong>Job Title:</strong> ${jobTitle}</p>
      <p><strong>Total Applications:</strong> ${totalApplications}</p>

      <table border="1" cellpadding="8" cellspacing="0">
        <thead>
          <tr>
            <th>#</th>
            <th>Candidate Name</th>
            <th>Email</th>
            <th>Phone</th>
          </tr>
        </thead>
        <tbody>
          ${applicantsHtml}
        </tbody>
      </table>
      
      <br/>
      <p>Please log in to your dashboard to review the complete profiles of these candidates.</p>
      <p>Regards,<br/>E2Score Team</p>
  `;
};
