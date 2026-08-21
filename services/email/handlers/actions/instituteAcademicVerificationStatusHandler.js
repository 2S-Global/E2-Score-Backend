import { instituteAcademicVerificationStatusTemplate } from "../../templates/instituteAcademicVerificationStatusTemplate.js";
import { sendMail } from "../../emailService.js";

export const instituteAcademicVerificationStatusHandler = async (job) => {
    const { email, userName, instituteName, levelVerified, courseTypeVerified, courseNameVerified, durationVerified, gradingSystemVerified, marksVerified, remarks } = job.data;
    const html = instituteAcademicVerificationStatusTemplate(userName, instituteName, levelVerified, courseTypeVerified, courseNameVerified, durationVerified, gradingSystemVerified, marksVerified, remarks);
    
    await sendMail({
        type: "verification",
      to: email,
      subject: "Academic Verification Status Updated",
      html: html,
    });
};
