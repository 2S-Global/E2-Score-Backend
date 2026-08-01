import { sendMail } from "../../emailService.js";
import { itskillDeletedTemplate } from "../../templates/itskillDeletedTemplate.js";

export const itskillDeletedHandler = async (job) => {
    const { userdtl, to } = job.data;
    const html = itskillDeletedTemplate(userdtl);
    
    await sendMail({
        to: to,
        subject: "Itskill List Update Notification",
        html: html,
    });
}
