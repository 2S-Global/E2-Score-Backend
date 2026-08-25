import { sendMail } from "../../emailService.js";
import { employmentUpdatedTemplate } from "../../templates/employmentUpdatedTemplate.js";

export const employmentUpdatedHandler = async (job) => {
    const { userdtl, to } = job.data;
    const html = employmentUpdatedTemplate(userdtl);
    
    await sendMail({
        type: "experience",
        to: to,
        subject: "Employment Update Notification",
        html: html,
    });
}
