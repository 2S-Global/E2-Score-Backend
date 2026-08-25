import { sendMail } from "../../emailService.js";
import { onlineProfileDeletedTemplate } from "../../templates/onlineProfileDeletedTemplate.js";

export const onlineProfileDeletedHandler = async (job) => {
    const { userdtl, to } = job.data;
    const html = onlineProfileDeletedTemplate(userdtl);
    
    await sendMail({
        type: "profile",
        to: to,
        subject: "Online Profile Update Notification",
        html: html,
    });
}
