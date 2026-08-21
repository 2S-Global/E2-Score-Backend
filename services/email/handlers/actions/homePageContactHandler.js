import { homePageContactTemplate } from "../../templates/homePageContactTemplate.js";
import { sendMail } from "../../emailService.js";

export const homePageContactHandler = async (job) => {
    const { name, email, subject, message } = job.data;
    const html = homePageContactTemplate(name, email, subject, message);
    
    await sendMail({
        type: "verification",
      to: "chandrasarkar2sglobal@gmail.com",
      subject: `📩 New Contact Form Submission: ${subject}`,
      html: html,
    });
};
