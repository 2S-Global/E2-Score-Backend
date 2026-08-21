import { sendMail } from "../../emailService.js";
import { researchPublicationAddedTemplate } from "../../templates/researchPublicationAddedTemplate.js";

export const researchPublicationAddedHandler = async (job) => {
    const { userdtl, to } = job.data;
    const html = researchPublicationAddedTemplate(userdtl);
    
    await sendMail({
        type: "research",
        to: to,
        subject: "Profile Update Notification",
        html: html,
    });
}
