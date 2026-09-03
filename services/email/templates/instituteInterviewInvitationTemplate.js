export const instituteInterviewInvitationTemplate = (
  studentName,
  role,
  recruiterName,
  date,
  time,
) => {
  const dateTime = `
        <ul>
          <li><strong>Date:</strong> ${date}</li>
          <li><strong>Time:</strong> ${time}</li>
        </ul>
      `;

  return `<p>Dear <strong>${studentName}</strong>,</p>
        <p>We are pleased to invite you to an interview for the position of ${role} at ${recruiterName}.</p>
        <p>Interview Details:</p>
        ${dateTime}
        <p>If you have any questions, feel free to contact us.</p>
        <br/>
        <p>Regards,<br/>Global Employability Information Services India Limited</p>`;
};
