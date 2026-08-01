import { sendMail } from "../../emailService.js";
import { kycVerficationTemplate } from "../../templates/kycVerificationTemplate.js";


export const kycVerficationHandler = async (job) => {
    const { user, changeListHTML } = job.data;
    const dynamicHTML = kycVerficationTemplate(user, changeListHTML)

    await sendMail({
        to: user.email,
        subject: "KYC Update Notification",
        html: dynamicHTML,
    });


}