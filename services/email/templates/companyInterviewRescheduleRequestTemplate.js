export const companyInterviewRescheduleRequestTemplate = (employerName, candidateName, jobTitle, requestDateString, requestStartTime, requestEndTime) => {
  return `
          <p>Hello ${employerName || "Employer"},</p>

          <p>
            The candidate <strong>${candidateName}</strong> has requested
            to <strong>reschedule</strong> the interview for the position
            <strong>${jobTitle}</strong>.
          </p>

          <p><strong>Requested Schedule:</strong></p>
          <ul>
            <li><strong>Date:</strong> ${requestDateString}</li>
            <li><strong>Time Window:</strong> ${requestStartTime} – ${requestEndTime}</li>
          </ul>

          <p>
            Please log in to your dashboard to review and take action
            on this reschedule request.
          </p>

          <p>
            Regards,<br />
            <strong>GEISIL</strong>
          </p>
        `;
};
