import { sendMail } from "../../emailService.js";
import { workSampleUpdatedTemplate } from "../../templates/workSampleUpdatedTemplate.js";

export const workSampleUpdatedHandler = async (job) => {
    const { userdtl, to } = job.data;
    const html = workSampleUpdatedTemplate(userdtl);
    
    await sendMail({
        type: "profile",
        to: to,
        subject: "Work Profile Update Notification",
        html: html,
    });
}
