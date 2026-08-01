import { sendMail } from "../../emailService.js";
import { onlineProfileUpdatedTemplate } from "../../templates/onlineProfileUpdatedTemplate.js";

export const onlineProfileUpdatedHandler = async (job) => {
    const { userdtl, to } = job.data;
    const html = onlineProfileUpdatedTemplate(userdtl);
    
    await sendMail({
        to: to,
        subject: "Online Profile Update Notification",
        html: html,
    });
}
