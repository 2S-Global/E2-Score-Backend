import { sendMail } from "../../emailService.js";
import { resumeDeletedTemplate } from "../../templates/resumeDeletedTemplate.js";

export const resumeDeletedHandler = async (job) => {
  const { to, userdtl } = job.data;
  const htmlEmail = resumeDeletedTemplate(userdtl);

  await sendMail({
    type: "documents",
    to,
    subject: "Resume Update Notification",
    html: htmlEmail
  });
};
