import { companyOfferLetterResponseTemplate } from "../../templates/companyOfferLetterResponseTemplate.js";
import { sendMail } from "../../emailService.js";

export const companyOfferLetterResponseHandler = async (job) => {
    const { email, accept, employerName, candidateName, jobTitle } = job.data;
    const html = companyOfferLetterResponseTemplate(accept, employerName, candidateName, jobTitle);
    
    await sendMail({
      to: email,
      subject: accept ? `Offer Letter Accepted – ${jobTitle}` : `Offer Letter Rejected – ${jobTitle}`,
      html: html,
    });
};
