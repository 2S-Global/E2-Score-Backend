import { companyInterviewInvitationTemplate } from "../../templates/companyInterviewInvitationTemplate.js";
import { sendMail } from "../../emailService.js";

export const companyInterviewInvitationHandler = async (job) => {
  const {
    email,
    userName,
    designation,
    companyName,
    interviewDateString,
    formattedInterviewTime,
    interviewLocation,
    applicationId,
    jobId,
    loginId,
  } = job.data;
  const html = await companyInterviewInvitationTemplate(
    userName,
    designation,
    companyName,
    interviewDateString,
    formattedInterviewTime,
    interviewLocation,
    applicationId,
    jobId,
    loginId,
  );

  await sendMail({
    type: "interviews",
    to: email,
    subject: `Interview Invitation – ${designation} at ${companyName}`,
    html: html,
  });
};
