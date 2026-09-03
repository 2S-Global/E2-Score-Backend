export const instituteRecruiterInterviewScheduleTemplate = (
  total,
  date,
  role,
  studentsTableHtml,
) => {
  return `<p>Dear <strong>Recruiter</strong>,</p>
        <p>Please find the details of  ${total} candidates scheduled for interviews on  ${date} for the position of ${role}.</p>
        <div>${studentsTableHtml}</div>
        <p>Kindly review the candidate list and confirm the interview schedule. Please let me know if any additional information or documentation is required.</p>
        <p>Thank you for your assistance.</p>
        <br/>
        <p>Regards,<br/>Global Employability Information Services India Limited</p>`;
};
