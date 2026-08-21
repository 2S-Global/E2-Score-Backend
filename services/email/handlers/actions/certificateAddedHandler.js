import { sendMail } from "../../emailService.js";
import { certificateAddedTemplate } from "../../templates/certificateAddedTemplate.js";

export const certificateAddedHandler = async (job) => {
    const { userdtl, to } = job.data;
    const html = certificateAddedTemplate(userdtl);
    
    await sendMail({
        type: "achievements",
        to: to,
        subject: "Certification Update Notification",
        html: html,
    });
}
