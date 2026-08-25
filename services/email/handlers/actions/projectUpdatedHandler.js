import { projectUpdatedTemplate } from "../../templates/projectUpdatedTemplate.js";
import { sendMail } from "../../emailService.js";

export const projectUpdatedHandler = async (job) => {
  const { to, userdtl } = job.data;
  
  if (!to || !userdtl) {
    throw new Error("Missing required fields for project_updated job");
  }

  const html = projectUpdatedTemplate(userdtl);
  
  await sendMail({
    type: "projects",
    to,
    subject: "Project Details Update Notification",
    html
  });
};
