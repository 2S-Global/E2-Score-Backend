import { sendMail } from "../../emailService.js";
import { otherskillAddedTemplate } from "../../templates/otherskillAddedTemplate.js";

export const otherskillAddedHandler = async (job) => {
    const { userdtl, to } = job.data;
    const html = otherskillAddedTemplate(userdtl);
    
    await sendMail({
        to: to,
        subject: "Otherskill List Update Notification",
        html: html,
    });
}
