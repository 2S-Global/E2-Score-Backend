
import { sendMail } from "../../emailService.js";
import { projectDeletedTemplate } from "../../templates/projectDeletedTemplate.js";

export async function processDeleteMail(job) {
  const { email, name } = job.data;

  if (!email || !name) {
    throw new Error(`Invalid payload for job ${job.id}: missing email or name`);
  }

  const dynamicHtml = projectDeletedTemplate(name);

  await sendMail({
        type: "projects",
    to: email,
    subject: "Project Details Update Notification",
    html: dynamicHtml,
  });
}