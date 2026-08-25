import { sendMail } from "../../emailService.js";
import { employmentDeletedTemplate } from "../../templates/employmentDeletedTemplate.js";

export const employmentDeletedHandler = async (job) => {
    const { userdtl, to } = job.data;
    const html = employmentDeletedTemplate(userdtl);
    
    await sendMail({
        type: "experience",
        to: to,
        subject: "Employment Update Notification",
        html: html,
    });
}
