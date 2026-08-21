import { sendMail } from "../../emailService.js";
import { itskillUpdatedTemplate } from "../../templates/itskillUpdatedTemplate.js";

export const itskillUpdatedHandler = async (job) => {
    const { userdtl, to } = job.data;
    const html = itskillUpdatedTemplate(userdtl);
    
    await sendMail({
        type: "skills",
        to: to,
        subject: "Itskill List Update Notification",
        html: html,
    });
}
