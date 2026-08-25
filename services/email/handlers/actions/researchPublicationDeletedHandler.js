import { sendMail } from "../../emailService.js";
import { researchPublicationDeletedTemplate } from "../../templates/researchPublicationDeletedTemplate.js";

export const researchPublicationDeletedHandler = async (job) => {
    const { userdtl, to } = job.data;
    const html = researchPublicationDeletedTemplate(userdtl);
    
    await sendMail({
        type: "research",
        to: to,
        subject: "Profile Update Notification",
        html: html,
    });
}
