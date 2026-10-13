import { sendMail } from "../../emailService.js";
import { jobInvitationTemplate } from "../../templates/jobInvitationTemplate.js";

export const jobInvitationHandler = async (job) => {
  const { name, email, jobTitle, companyName, respondUrl } = job.data;

  await sendMail({
    type: "verification",
    to: email,
    subject: `Job invitation: ${jobTitle}`,
    html: jobInvitationTemplate({ name, jobTitle, companyName, respondUrl }),
  });
};
