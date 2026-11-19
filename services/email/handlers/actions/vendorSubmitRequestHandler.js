import { sendMail } from "../../emailService.js";
import { vendorSubmitRequestTemplate } from "../../templates/vendorSubmitRequestTemplate.js";

export const vendorSubmitRequestHandler = async (job) => {
  const {
    email,
    recipientName,
    jobTitle,
    candidateCount,
    requestId,
    branchName,
    companyName,
  } = job.data;
  if (
    !email ||
    !recipientName ||
    !jobTitle ||
    !Number.isInteger(candidateCount) ||
    !requestId
  ) {
    throw new Error(
      `Invalid payload for job ${job.id}: missing vendor request details`,
    );
  }

  await sendMail({
    type: "submitrequest",
    to: email,
    subject: `Candidate request for ${jobTitle}`,
    html: vendorSubmitRequestTemplate({
      recipientName,
      jobTitle,
      candidateCount,
      requestId,
      branchName,
      companyName,
    }),
  });
};
