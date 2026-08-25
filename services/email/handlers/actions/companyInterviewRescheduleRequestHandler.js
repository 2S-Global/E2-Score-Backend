import { companyInterviewRescheduleRequestTemplate } from "../../templates/companyInterviewRescheduleRequestTemplate.js";
import { sendMail } from "../../emailService.js";

export const companyInterviewRescheduleRequestHandler = async (job) => {
    const { email, employerName, candidateName, jobTitle, requestDateString, requestStartTime, requestEndTime } = job.data;
    const html = companyInterviewRescheduleRequestTemplate(employerName, candidateName, jobTitle, requestDateString, requestStartTime, requestEndTime);
    
    await sendMail({
        type: "interviews",
      to: email,
      subject: `Reschedule Request – ${jobTitle}`,
      html: html,
    });
};
