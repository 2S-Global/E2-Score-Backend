import { sendMail } from "../../emailService.js";
import { certificateDeletedTemplate } from "../../templates/certificateDeletedTemplate.js";

export const certificateDeletedHandler = async (job) => {
    const { userdtl, to } = job.data;
    const html = certificateDeletedTemplate(userdtl);
    
    await sendMail({
        to: to,
        subject: "Certification Update Notification",
        html: html,
    });
}
