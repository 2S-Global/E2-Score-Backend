import { sendMail } from "../../emailService.js";
import { otherskillUpdatedTemplate } from "../../templates/otherskillUpdatedTemplate.js";

export const otherskillUpdatedHandler = async (job) => {
    const { userdtl, to } = job.data;
    const html = otherskillUpdatedTemplate(userdtl);
    
    await sendMail({
        to: to,
        subject: "Other Skill Update Notification",
        html: html,
    });
}
