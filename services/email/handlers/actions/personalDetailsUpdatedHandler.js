import { sendMail } from "../../emailService.js";
import { personalDetailsUpdatedTemplate } from "../../templates/personalDetailsUpdatedTemplate.js";

export const personalDetailsUpdatedHandler = async (job) => {
    const { user, changeListHTML, to } = job.data;
    const html = personalDetailsUpdatedTemplate(user, changeListHTML);
    
    await sendMail({
        type: "personal",
        to: to,
        subject: "Profile Update Notification",
        html: html,
    });
}
