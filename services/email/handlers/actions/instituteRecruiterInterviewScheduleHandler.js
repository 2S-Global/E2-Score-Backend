import { instituteRecruiterInterviewScheduleTemplate } from "../../templates/instituteRecruiterInterviewScheduleTemplate.js";
import { sendMail } from "../../emailService.js";

export const instituteRecruiterInterviewScheduleHandler = async (job) => {
  const { recruiterEmail, total, date, role, studentsTableHtml } = job.data;
  const html = instituteRecruiterInterviewScheduleTemplate(total, date, role, studentsTableHtml);

  await sendMail({
    to: recruiterEmail,
    subject: `Position Interview Schedule Submission – ${total} Candidates for ${role}`,
    html: html,
  });
};
