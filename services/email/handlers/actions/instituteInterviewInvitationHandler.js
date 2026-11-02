import { instituteInterviewInvitationTemplate } from "../../templates/instituteInterviewInvitationTemplate.js";
import { sendMail } from "../../emailService.js";

export const instituteInterviewInvitationHandler = async (job) => {
  const {
    studentName,
    studentEmail,
    role,
    recruiterName,
    date,
    time,
    institueName,
  } = job.data;
  const html = instituteInterviewInvitationTemplate(
    studentName,
    role,
    recruiterName,
    date,
    time,
    institueName,
  );

  await sendMail({
    type: "interviews",
    to: studentEmail,
    subject: `Interview Invitation for ${role} Position`,
    html: html,
  });
};
