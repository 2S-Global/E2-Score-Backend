import { sendMail } from "../../emailService.js";
import { patentDeletedTemplate } from "../../templates/patentDeletedTemplate.js";

export const patentDeletedHandler = async (job) => {
    const { userdtl, to } = job.data;
    const html = patentDeletedTemplate(userdtl);
    
    await sendMail({
        to: to,
        subject: "Patent Update Notification",
        html: html,
    });
}
