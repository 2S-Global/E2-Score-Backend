import { instituteStudentProfileCompletionTemplate } from "../../templates/instituteStudentProfileCompletionTemplate.js";
import { sendMail } from "../../emailService.js";

export const instituteStudentProfileCompletionHandler = async (job) => {
  const { name, email, progress, institute } = job.data;
  const html = instituteStudentProfileCompletionTemplate(
    name,
    progress,
    institute,
  );

  await sendMail({
    type: "profile",
    to: email,
    subject: `Profile Completion Reminder - Current Score: ${progress}%`,
    html: html,
  });
};
