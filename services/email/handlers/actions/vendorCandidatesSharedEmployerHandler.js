import { sendMail } from "../../emailService.js";
import { vendorCandidatesSharedEmployerTemplate } from "../../templates/vendorCandidatesSharedEmployerTemplate.js";

export const vendorCandidatesSharedEmployerHandler = async (job) => {
  const {
    employerName,
    employerEmail,
    vendorName,
    companyName,
    jobTitle,
    candidateCount,
  } = job.data;
  if (
    !employerName ||
    !employerEmail ||
    !vendorName ||
    !companyName ||
    !jobTitle ||
    !Number.isInteger(candidateCount) ||
    candidateCount < 1
  ) {
    throw new Error(
      `Invalid payload for job ${job.id}: missing employer candidate share details`,
    );
  }

  await sendMail({
    type: "submitrequest",
    to: employerEmail,
    subject: `${candidateCount} candidates shared for ${jobTitle}`,
    html: vendorCandidatesSharedEmployerTemplate({
      employerName,
      vendorName,
      companyName,
      jobTitle,
      candidateCount,
    }),
  });
};
