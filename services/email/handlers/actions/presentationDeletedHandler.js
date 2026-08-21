import { sendMail } from "../../emailService.js";
import { presentationDeletedTemplate } from "../../templates/presentationDeletedTemplate.js";

export const presentationDeletedHandler = async (job) => {
    const { userdtl, to } = job.data;
    const html = presentationDeletedTemplate(userdtl);
    
    await sendMail({
        type: "achievements",
        to: to,
        subject: "Presentation Update Notification",
        html: html,
    });
}
