import { sendMail } from "../../emailService.js";
import { jobInvitationTemplate } from "../../templates/jobInvitationTemplate.js";

export const jobInvitationHandler = async (job) => {
  const { name, email, jobTitle, companyName, respondUrl, loginId } = job.data;
  let html = await jobInvitationTemplate({
    name,
    jobTitle,
    companyName,
    respondUrl,
    loginId,
  });

  await sendMail({
    type: "verification",
    to: email,
    subject: `Job invitation: ${jobTitle}`,
    html: html,
  });
};
