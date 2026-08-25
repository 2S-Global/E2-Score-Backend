import { companyRegistrationTemplate } from "../../templates/companyRegistrationTemplate.js";
import { sendMail } from "../../emailService.js";

export const companyRegistrationHandler = async (job) => {
    const { name, email, password } = job.data;
    const html = companyRegistrationTemplate(name, email, password);
    await sendMail({
        type: "registration",
        to: email,
        subject: "Access Credentials for E2Score - Fast & Accurate KYC Verification Platform",
        html: html,
    });
};
