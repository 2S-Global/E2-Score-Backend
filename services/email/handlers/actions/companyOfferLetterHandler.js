import { companyOfferLetterTemplate } from "../../templates/companyOfferLetterTemplate.js";
import { sendMail } from "../../emailService.js";

export const companyOfferLetterHandler = async (job) => {
    const { email, userName, offer_letter_designation, companyName, offer_letter_joining_date_string, offer_letter_salary, offer_letter_message } = job.data;
    const html = companyOfferLetterTemplate(userName, offer_letter_designation, companyName, offer_letter_joining_date_string, offer_letter_salary, offer_letter_message);
    
    await sendMail({
        type: "jobs",
      to: email,
      subject: `Offer Letter – ${offer_letter_designation}`,
      html: html,
    });
};
