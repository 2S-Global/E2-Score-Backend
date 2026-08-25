import { instituteRegistrationTemplate } from "../../templates/instituteRegistrationTemplate.js";
import { sendMail } from "../../emailService.js";

export const instituteRegistrationHandler = async (job) => {
    const { name, email, password, token } = job.data;
    const html = instituteRegistrationTemplate(name, email, password, token);
    
    await sendMail({
        type: "registration",
      to: email,
      subject: "Access Credentials for Geisil",
      html: html,
    });
};
