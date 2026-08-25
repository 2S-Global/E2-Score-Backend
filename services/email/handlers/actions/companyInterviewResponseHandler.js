import { companyInterviewResponseTemplate } from "../../templates/companyInterviewResponseTemplate.js";
import { sendMail } from "../../emailService.js";

export const companyInterviewResponseHandler = async (job) => {
    const { email, accept, employerName, candidateName, jobTitle } = job.data;
    const html = companyInterviewResponseTemplate(accept, employerName, candidateName, jobTitle);
    
    await sendMail({
        type: "interviews",
      to: email,
      subject: accept ? `Interview Invitation Accepted – ${jobTitle}` : `Interview Invitation Rejected – ${jobTitle}`,
      html: html,
    });
};
