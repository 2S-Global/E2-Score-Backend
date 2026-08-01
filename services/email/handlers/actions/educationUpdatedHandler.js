import { sendMail } from "../../emailService.js";
import { educationUpdatedTemplate } from "../../templates/educationUpdatedTemplate.js";

export const educationUpdatedHandler = async (job) => {
    const { userdtl, to } = job.data;
    const html = educationUpdatedTemplate(userdtl);
    
    await sendMail({
        to: to,
        subject: "Academic Details Update Notification",
        html: html,
    });
}
