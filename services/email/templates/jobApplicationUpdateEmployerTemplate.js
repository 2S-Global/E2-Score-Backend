export const jobApplicationUpdateEmployerTemplate = (job) => `
  <div style="font-family: Arial, sans-serif; color:#333; padding:20px; line-height:1.6; max-width:600px; margin:auto; background:#f9f9f9; border-radius:8px;">
    <h2>Application Update Notification</h2>

    <p>
      You have received a new update regarding applications for the job:
    </p>

    <p><strong>Job Title:</strong> ${job.jobTitle}</p>

    <h3>Candidate Details</h3>
    <table cellpadding="6" cellspacing="0" border="0">
      <tr>
        <td><strong>Name</strong></td>
        <td>${job.candidateName}</td>
      </tr>
      <tr>
        <td><strong>Email</strong></td>
        <td>${job.candidateEmail}</td>
      </tr>
      <tr>
        <td><strong>Phone</strong></td>
        <td>${job.candidatePhone || "N/A"}</td>
      </tr>
    </table>

    <br/>

    <p>
      Please log in to your employer dashboard to review the application details.
    </p>

    <br/>
    <p>— Team GEISIL</p>
  </div>
`;
