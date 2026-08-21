import { sendMail } from "../../emailService.js";
import { jobApplicationUpdateEmployerTemplate } from "../../templates/jobApplicationUpdateEmployerTemplate.js";

export const jobApplicationUpdateEmployerHandler = async (job) => {
    const { employerEmail, job: jobData } = job.data;
    const html = jobApplicationUpdateEmployerTemplate(jobData);

    await sendMail({
        type: "jobs",
        to: employerEmail,
        subject: `New Application Update – ${jobData.jobTitle}`,
        html: html,
    });
};
