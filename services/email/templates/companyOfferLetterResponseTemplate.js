export const companyOfferLetterResponseTemplate = (accept, employerName, candidateName, jobTitle) => {
  if (accept) {
    return `
            <p>Hello ${employerName || "Employer"},</p>

            <p>
              The candidate <strong>${candidateName || "Candidate"}</strong>
              has accepted the offer letter for the position
              <strong>${jobTitle}</strong>.
            </p>

            <p>
              Kindly log in to your dashboard to proceed with the onboarding and joining formalities.
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
            has <strong>declined</strong> the offer letter for the position
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
