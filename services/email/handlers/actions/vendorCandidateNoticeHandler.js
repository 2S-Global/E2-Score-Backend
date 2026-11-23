import { vendorCandidateNoticeTemplate } from "../../templates/vendorCandidateNoticeTemplate.js";
import { sendMail } from "../../emailService.js";

export const vendorCandidateNoticeHandler = async (job) => {
  const { name, email, vendorName } = job.data;
  if (!name || !email || !vendorName) {
    throw new Error(
      `Invalid payload for job ${job.id}: missing vendor candidate notice details`,
    );
  }

  await sendMail({
    type: "submitrequest",
    to: email,
    subject: `${vendorName} added you as a candidate`,
    html: vendorCandidateNoticeTemplate(name, vendorName),
  });
};
