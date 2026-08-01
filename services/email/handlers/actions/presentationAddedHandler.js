import { sendMail } from "../../emailService.js";
import { presentationAddedTemplate } from "../../templates/presentationAddedTemplate.js";

export const presentationAddedHandler = async (job) => {
    const { userdtl, to } = job.data;
    const html = presentationAddedTemplate(userdtl);
    
    await sendMail({
        to: to,
        subject: "Presentation Update Notification",
        html: html,
    });
}
