import { sendMail } from "../../emailService.js";
import { onlineProfileAddedTemplate } from "../../templates/onlineProfileAddedTemplate.js";

export const onlineProfileAddedHandler = async (job) => {
    const { userdtl, to } = job.data;
    const html = onlineProfileAddedTemplate(userdtl);
    
    await sendMail({
        to: to,
        subject: "Online Profile Update Notification",
        html: html,
    });
}
