import { sendMail } from "../../emailService.js";
import { workSampleDeletedTemplate } from "../../templates/workSampleDeletedTemplate.js";

export const workSampleDeletedHandler = async (job) => {
    const { userdtl, to } = job.data;
    const html = workSampleDeletedTemplate(userdtl);
    
    await sendMail({
        to: to,
        subject: "Work Profile Update Notification",
        html: html,
    });
}
