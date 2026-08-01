import { sendMail } from "../../emailService.js";
import { employmentAddedTemplate } from "../../templates/employmentAddedTemplate.js";

export const employmentAddedHandler = async (job) => {
    const { userdtl, to } = job.data;
    const html = employmentAddedTemplate(userdtl);
    
    await sendMail({
        to: to,
        subject: "Employment Update Notification",
        html: html,
    });
}
