import { companyOfferSentNotificationTemplate } from "../../templates/companyOfferSentNotificationTemplate.js";
import { sendMail } from "../../emailService.js";

export const companyOfferSentNotificationHandler = async (job) => {
    const { email, designation, userName, userEmail, offer_letter_designation, offer_letter_joining_date_string, offer_letter_salary } = job.data;
    const html = companyOfferSentNotificationTemplate(designation, userName, userEmail, offer_letter_designation, offer_letter_joining_date_string, offer_letter_salary);
    
    await sendMail({
        type: "jobs",
      to: email,
      subject: `Offer Sent to Candidate – ${offer_letter_designation}`,
      html: html,
    });
};
