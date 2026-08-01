import { sendMail } from "../../emailService.js";
import { patentUpdatedTemplate } from "../../templates/patentUpdatedTemplate.js";

export const patentUpdatedHandler = async (job) => {
    const { userdtl, to } = job.data;
    const html = patentUpdatedTemplate(userdtl);
    
    await sendMail({
        to: to,
        subject: "Patent Update Notification",
        html: html,
    });
}
