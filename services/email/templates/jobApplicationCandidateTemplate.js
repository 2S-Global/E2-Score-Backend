export const jobApplicationCandidateTemplate = (job) => `
  <div style="font-family: Arial, sans-serif; color:#333; padding:20px; line-height:1.6; max-width:600px; margin:auto; background:#f9f9f9; border-radius:8px;">
    <h2>Application Confirmation</h2>

    <p>Hi <strong>${job.candidateName}</strong>,</p>

    <p>
      Thank you for applying for the position of 
      <strong>${job.jobTitle}</strong>.
    </p>

    <p>
      We have successfully received your application. Our team will review your profile,
      and if shortlisted, the employer will contact you for the next steps.
    </p>

    <h3>Your Submitted Details</h3>
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
      You can log in to your account anytime to track your application status.
    </p>

    <br/>
    <p>Best regards,<br/>Team GEISIL</p>
  </div>
`;
