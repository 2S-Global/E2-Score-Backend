import { coverLetterUploadedTemplate } from "../../templates/coverLetterUploadedTemplate.js";
import { sendMail } from "../../emailService.js";

export const coverLetterUploadedHandler = async (job) => {
  const { to, userdtl } = job.data;
  const html = coverLetterUploadedTemplate(userdtl.name);
  console.log('TYPE====>', "documents")
  await sendMail({
    type: "documents",
    to: to,
    subject: "Cover Letter Update Notification",
    html: html,
  });
};
