import { sendMail } from "../../emailService.js";
import { profileUpdatedTemplate } from "../../templates/profileUpdatedTemplate.js";

export const profileUpdatedHandler = async (job) => {
    const { user, changeListHTML, to } = job.data;
    const html = profileUpdatedTemplate(user, changeListHTML);

    await sendMail({
        type: "profile",
        to: to,
        subject: "Profile Update Notification",
        html: html,
    });
}
