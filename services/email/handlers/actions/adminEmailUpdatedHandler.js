import { adminEmailUpdatedTemplate } from "../../templates/adminEmailUpdatedTemplate.js";
import { sendMail } from "../../emailService.js";

export const adminEmailUpdatedHandler = async (job) => {
    const { name, email } = job.data;
    const html = adminEmailUpdatedTemplate(name, email);
    
    await sendMail({
        type: "registration",
      to: email,
      subject: "Your Email Address Has Been Updated QuikChek - Fast & Accurate KYC Verification Platform",
      html: html,
    });
};
