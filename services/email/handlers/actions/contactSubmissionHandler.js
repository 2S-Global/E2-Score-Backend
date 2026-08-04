import { contactSubmissionTemplate } from "../../templates/contactSubmissionTemplate.js";
import { sendMail } from "../../emailService.js";

export const contactSubmissionHandler = async (job) => {
    const { name, email, subject, message, dispute } = job.data;
    const html = contactSubmissionTemplate(name, email, subject, message, dispute);
    
    await sendMail({
      to: "kp.sunit@gmail.com",
      cc: ["d.dey1988@gmail.com", "avik@2sglobal.co", "abhishek@2sglobal.us"],
      subject: dispute
        ? `⚠️ New Dispute Form Submission: ${subject}`
        : `📩 New Contact Form Submission: ${subject}`,
      html: html,
    });
};
