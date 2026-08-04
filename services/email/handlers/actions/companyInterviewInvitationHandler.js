import { companyInterviewInvitationTemplate } from "../../templates/companyInterviewInvitationTemplate.js";
import { sendMail } from "../../emailService.js";

export const companyInterviewInvitationHandler = async (job) => {
    const { email, userName, designation, companyName, interviewDateString, formattedInterviewTime, interviewLocation, applicationId, jobId } = job.data;
    const html = companyInterviewInvitationTemplate(userName, designation, companyName, interviewDateString, formattedInterviewTime, interviewLocation, applicationId, jobId);
    
    await sendMail({
      to: email,
      subject: `Interview Invitation – ${designation} at ${companyName}`,
      html: html,
    });
};
