import { sendMail } from "../../emailService.js";
import { certificateUpdatedTemplate } from "../../templates/certificateUpdatedTemplate.js";

export const certificateUpdatedHandler = async (job) => {
    const { userdtl, to } = job.data;
    const html = certificateUpdatedTemplate(userdtl);
    
    await sendMail({
        to: to,
        subject: "Certification Update Notification",
        html: html,
    });
}
