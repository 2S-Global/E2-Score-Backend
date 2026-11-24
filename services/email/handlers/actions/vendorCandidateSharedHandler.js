import { sendMail } from "../../emailService.js";
import { vendorCandidateSharedTemplate } from "../../templates/vendorCandidateSharedTemplate.js";

export const vendorCandidateSharedHandler = async (job) => {
  const { candidateName, email, vendorName, companyName, jobTitle } = job.data;
  if (!candidateName || !email || !vendorName || !companyName || !jobTitle) {
    throw new Error(
      `Invalid payload for job ${job.id}: missing candidate share details`,
    );
  }

  await sendMail({
    type: "submitrequest",
    to: email,
    subject: `Job opportunity shared by ${companyName}: ${jobTitle}`,
    html: vendorCandidateSharedTemplate({
      candidateName,
      vendorName,
      companyName,
      jobTitle,
    }),
  });
};
