import { sendMail } from "../../emailService.js";
import { resumeUploadedTemplate } from "../../templates/resumeUploadedTemplate.js";

export const resumeUploadedHandler = async (job) => {
  const { to, userdtl } = job.data;
  const htmlEmail = resumeUploadedTemplate(userdtl);

  await sendMail(to, "Resume Update Notification", htmlEmail);
};
