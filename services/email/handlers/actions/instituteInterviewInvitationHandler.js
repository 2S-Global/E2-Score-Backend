import { instituteInterviewInvitationTemplate } from "../../templates/instituteInterviewInvitationTemplate.js";
import { sendMail } from "../../emailService.js";

export const instituteInterviewInvitationHandler = async (job) => {
  const { studentName, studentEmail, role, recruiterName, date, time } = job.data;
  const html = instituteInterviewInvitationTemplate(studentName, role, recruiterName, date, time);

  await sendMail({
        type: "interviews",
    to: studentEmail,
    subject: `Interview Invitation for ${role} Position`,
    html: html,
  });
};
