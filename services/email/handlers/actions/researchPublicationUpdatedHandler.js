import { sendMail } from "../../emailService.js";
import { researchPublicationUpdatedTemplate } from "../../templates/researchPublicationUpdatedTemplate.js";

export const researchPublicationUpdatedHandler = async (job) => {
    const { userdtl, to } = job.data;
    const html = researchPublicationUpdatedTemplate(userdtl);
    
    await sendMail({
        to: to,
        subject: "Profile Update Notification",
        html: html,
    });
}
