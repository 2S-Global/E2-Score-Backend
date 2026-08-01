import { sendMail } from "../../emailService.js";
import { presentationUpdatedTemplate } from "../../templates/presentationUpdatedTemplate.js";

export const presentationUpdatedHandler = async (job) => {
    const { userdtl, to } = job.data;
    const html = presentationUpdatedTemplate(userdtl);
    
    await sendMail({
        to: to,
        subject: "Presentation Update Notification",
        html: html,
    });
}
