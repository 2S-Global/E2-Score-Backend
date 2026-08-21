import { sendMail } from "../../emailService.js";
import { jobApplicationCandidateTemplate } from "../../templates/jobApplicationCandidateTemplate.js";

export const jobApplicationCandidateHandler = async (job) => {
    const { candidateEmail, job: jobData } = job.data;
    const html = jobApplicationCandidateTemplate(jobData);
    
    await sendMail({
        type: "jobs",
        to: candidateEmail,
        subject: `Application Submitted Successfully – ${jobData.jobTitle}`,
        html: html,
    });
};
