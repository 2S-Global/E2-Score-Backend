import { sendMail } from "../../emailService.js";
import { careerProfileAddedTemplate } from "../../templates/careerProfileAddedTemplate.js";

export const careerProfileAddedHandler = async (job) => {
    const { user, to } = job.data;
    const html = careerProfileAddedTemplate(user);
    
    await sendMail({
        to: to,
        subject: "Profile Update Notification",
        html: html,
    });
}
