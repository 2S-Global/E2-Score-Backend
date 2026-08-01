import { sendMail } from "../../emailService.js";
import { profilePictureUpdatedTemplate } from "../../templates/profilePictureUpdatedTemplate.js";

export const profilePictureUpdatedHandler = async (job) => {
    const { user, to } = job.data;
    const html = profilePictureUpdatedTemplate(user);
    
    await sendMail({
        to: to,
        subject: "Your Profile Picture Has Been Updated",
        html: html,
    });
}
