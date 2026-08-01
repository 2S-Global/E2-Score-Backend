import { sendMail } from "../../emailService.js";
import { workSampleAddedTemplate } from "../../templates/workSampleAddedTemplate.js";

export const workSampleAddedHandler = async (job) => {
    const { userdtl, to } = job.data;
    const html = workSampleAddedTemplate(userdtl);
    
    await sendMail({
        to: to,
        subject: "Work Profile Update Notification",
        html: html,
    });
}
