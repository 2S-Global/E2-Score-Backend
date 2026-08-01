import { sendMail } from "../../emailService.js";
import { projectAddedTemplate } from "../../templates/projectAddedTemplate.js";

export const processAddMail = async (job) => {
    const { email, name } = job.data;

    if (!email || !name) {
        throw new Error(`Invalid payload for job ${job.id}: missing email or name`);
    }

    const dynamicHtml = projectAddedTemplate(name);

    await sendMail({
        to: email,
        subject: "Project Details Update Notification",
        html: dynamicHtml,
    });

    console.log("[EmailWorker] Add email processed for user:", name);
}