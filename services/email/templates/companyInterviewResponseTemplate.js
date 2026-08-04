export const companyInterviewResponseTemplate = (accept, employerName, candidateName, jobTitle) => {
  if (accept) {
    return `
            <p>Hello ${employerName || "Employer"},</p>

            <p>
              The candidate <strong>${candidateName || "Candidate"}</strong>
              has accepted the interview invitation for the position
              <strong>${jobTitle}</strong>.
            </p>

            <p>
              Please log in to your dashboard to schedule the interview
              and proceed further.
            </p>

            <p>
              Regards,<br />
              <strong>GEISIL</strong>
            </p>
          `;
  } else {
    return `
          <p>Hello ${employerName || "Employer"},</p>

          <p>
            The candidate <strong>${candidateName || "Candidate"}</strong>
            has <strong>declined</strong> the interview invitation for the position
            <strong>${jobTitle}</strong>.
          </p>

          <p>
            You may review other applicants or invite another suitable
            candidate for the interview.
          </p>

          <p>
            Regards,<br />
            <strong>GEISIL</strong>
          </p>
        `;
  }
};
