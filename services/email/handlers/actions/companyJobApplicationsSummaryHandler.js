import { companyJobApplicationsSummaryTemplate } from "../../templates/companyJobApplicationsSummaryTemplate.js";
import { sendMail } from "../../emailService.js";

export const companyJobApplicationsSummaryHandler = async (job) => {
  const { employerEmail, jobTitle, totalApplications, applicantsHtml } = job.data;
  const html = companyJobApplicationsSummaryTemplate(jobTitle, totalApplications, applicantsHtml);

  await sendMail({
    to: employerEmail,
    subject: `Applications Received for ${jobTitle}`,
    html: html,
  });
};
