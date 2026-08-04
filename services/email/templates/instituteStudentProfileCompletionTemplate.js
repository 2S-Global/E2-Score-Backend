export const instituteStudentProfileCompletionTemplate = (name, progress) => `
      <div style="font-family: Arial, sans-serif;">
        <h2>Hello ${name || "Candidate"},</h2>

        <p>Your current profile completion score is:</p>

        <h1 style="color:#007bff;">
          ${progress}%
        </h1>

        <p>
          To improve your profile completion score and increase your chances of
          getting noticed by recruiters, please update your profile by:
        </p>

        <ul>
          <li>Adding educational details</li>
          <li>Uploading your resume</li>
          <li>Adding skills and certifications</li>
          <li>Completing personal information</li>
          <li>Adding project and work experience details</li>
        </ul>

        <p>
          A complete profile improves visibility and job opportunities.
        </p>

        <br/>

        <p>
          Best Regards,<br/>
          Placement Team
        </p>
      </div>
`;
