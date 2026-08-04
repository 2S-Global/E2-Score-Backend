import { companyEmploymentVerificationStatusTemplate } from "../../templates/companyEmploymentVerificationStatusTemplate.js";
import { sendMail } from "../../emailService.js";

export const companyEmploymentVerificationStatusHandler = async (job) => {
    const { email, employeeName, companyName, workedInCompanyBool, VerifiedBool, designationVerifiedBool, durationVerifiedBool, employmentTypeVerifiedBool, remarks } = job.data;
    const html = companyEmploymentVerificationStatusTemplate(employeeName, companyName, workedInCompanyBool, VerifiedBool, designationVerifiedBool, durationVerifiedBool, employmentTypeVerifiedBool, remarks);
    
    await sendMail({
      to: email,
      subject: "Employment Verification Status Updated",
      html: html,
    });
};
