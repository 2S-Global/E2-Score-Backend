import { sendMail } from "../../emailService.js";
import { resumeDeletedTemplate } from "../../templates/resumeDeletedTemplate.js";

export const resumeDeletedHandler = async (job) => {
  const { to, userdtl } = job.data;
  const htmlEmail = resumeDeletedTemplate(userdtl);

  await sendMail(to, "Resume Update Notification", htmlEmail);
};
