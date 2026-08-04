import { companyInterviewRescheduledTemplate } from "../../templates/companyInterviewRescheduledTemplate.js";
import { sendMail } from "../../emailService.js";

export const companyInterviewRescheduledHandler = async (job) => {
    const { email, userName, designation, companyName, interviewDateString, formattedInterviewTime, interviewLocation } = job.data;
    const html = companyInterviewRescheduledTemplate(userName, designation, companyName, interviewDateString, formattedInterviewTime, interviewLocation);
    
    await sendMail({
      to: email,
      subject: `Interview Rescheduled – ${designation} at ${companyName}`,
      html: html,
    });
};
