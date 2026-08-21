import { sendMail } from "../../emailService.js";
import { otherskillDeletedTemplate } from "../../templates/otherskillDeletedTemplate.js";

export const otherskillDeletedHandler = async (job) => {
    const { userdtl, to } = job.data;
    const html = otherskillDeletedTemplate(userdtl);
    
    await sendMail({
        type: "skills",
        to: to,
        subject: "Otherskill List Update Notification",
        html: html,
    });
}
