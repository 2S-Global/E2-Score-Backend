import { adminE2scoreCredentialsTemplate } from "../../templates/adminE2scoreCredentialsTemplate.js";
import { sendMail } from "../../emailService.js";

export const adminE2scoreCredentialsHandler = async (job) => {
    const { name, email, password } = job.data;
    const html = adminE2scoreCredentialsTemplate(name, email, password);
    
    await sendMail({
      to: email,
      subject: "Access Credentials for E2Score - Fast & Accurate KYC Verification Platform",
      html: html,
    });
};
