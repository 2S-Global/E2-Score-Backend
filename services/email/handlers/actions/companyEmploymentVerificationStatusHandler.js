import { companyEmploymentVerificationStatusTemplate } from "../../templates/companyEmploymentVerificationStatusTemplate.js";
import { sendMail } from "../../emailService.js";

export const companyEmploymentVerificationStatusHandler = async (job) => {
  const {
    email,
    employeeName,
    companyName,
    workedInCompanyBool,
    VerifiedBool,
    designationVerifiedBool,
    durationVerifiedBool,
    employmentTypeVerifiedBool,
    remarks,
    loginId,
  } = job.data;
  const html = await companyEmploymentVerificationStatusTemplate(
    employeeName,
    companyName,
    workedInCompanyBool,
    VerifiedBool,
    designationVerifiedBool,
    durationVerifiedBool,
    employmentTypeVerifiedBool,
    remarks,
    loginId,
  );

  await sendMail({
    type: "verification",
    to: email,
    subject: "Employment Verification Status Updated",
    html: html,
  });
};
