import { sendMail } from "../../emailService.js";
import { careerProfileUpdatedTemplate } from "../../templates/careerProfileUpdatedTemplate.js";

export const careerProfileUpdatedHandler = async (job) => {
    const { user, htmllist, to } = job.data;
    const html = careerProfileUpdatedTemplate(user, htmllist);
    
    await sendMail({
        type: "career",
        to: to,
        subject: "Career Profile Update Notification",
        html: html,
    });
}
