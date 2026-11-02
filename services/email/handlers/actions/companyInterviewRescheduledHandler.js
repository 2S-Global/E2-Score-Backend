import { companyInterviewRescheduledTemplate } from "../../templates/companyInterviewRescheduledTemplate.js";
import { sendMail } from "../../emailService.js";

export const companyInterviewRescheduledHandler = async (job) => {
  const {
    email,
    userName,
    designation,
    companyName,
    interviewDateString,
    formattedInterviewTime,
    interviewLocation,
    loginId,
  } = job.data;
  const html = await companyInterviewRescheduledTemplate(
    userName,
    designation,
    companyName,
    interviewDateString,
    formattedInterviewTime,
    interviewLocation,
    loginId,
  );

  await sendMail({
    type: "interviews",
    to: email,
    subject: `Interview Rescheduled – ${designation} at ${companyName}`,
    html: html,
  });
};
