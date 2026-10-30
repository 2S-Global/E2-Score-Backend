import { sendMail } from "../../emailService.js";
import { applicationShortlistedTemplate } from "../../templates/applicationShortlistedTemplate.js";

export const applicationShortlistedHandler = async (job) => {
  const { user, designation, companyName, loginId } = job.data;
  const html = await applicationShortlistedTemplate(
    user,
    designation,
    companyName,
    loginId,
  );

  await sendMail({
    type: "jobs",
    to: user.email,
    subject: "You have been shortlisted 🎉",
    html: html,
  });
};
