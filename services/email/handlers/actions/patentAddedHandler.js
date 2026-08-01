import { sendMail } from "../../emailService.js";
import { patentAddedTemplate } from "../../templates/patentAddedTemplate.js";

export const patentAddedHandler = async (job) => {
    const { userdtl, to } = job.data;
    const html = patentAddedTemplate(userdtl);
    
    await sendMail({
        to: to,
        subject: "Patent Update Notification",
        html: html,
    });
}
