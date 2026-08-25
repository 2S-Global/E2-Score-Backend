import { sendMail } from "../../emailService.js";
import { applicationShortlistedTemplate } from "../../templates/applicationShortlistedTemplate.js";

export const applicationShortlistedHandler = async (job) => {
    const { user, designation, companyName } = job.data;
    const html = applicationShortlistedTemplate(user, designation, companyName);
    
    await sendMail({
        type: "jobs",
        to: user.email,
        subject: "You have been shortlisted 🎉",
        html: html,
    });
};

