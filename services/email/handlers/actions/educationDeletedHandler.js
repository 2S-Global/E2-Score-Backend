import { sendMail } from "../../emailService.js";
import { educationDeletedTemplate } from "../../templates/educationDeletedTemplate.js";

export const educationDeletedHandler = async (job) => {
    const { userdtl, to } = job.data;
    const html = educationDeletedTemplate(userdtl);
    
    await sendMail({
        type: "education",
        to: to,
        subject: "Academic Details Deleted Notification",
        html: html,
    });
}
