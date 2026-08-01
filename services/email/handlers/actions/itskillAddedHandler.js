import { sendMail } from "../../emailService.js";
import { itskillAddedTemplate } from "../../templates/itskillAddedTemplate.js";

export const itskillAddedHandler = async (job) => {
    const { userdtl, to } = job.data;
    const html = itskillAddedTemplate(userdtl);
    
    await sendMail({
        to: to,
        subject: "Itskill List Update Notification",
        html: html,
    });
}
