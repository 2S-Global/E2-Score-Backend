import { companyPackageActivationResendTemplate } from "../../templates/companyPackageActivationResendTemplate.js";
import { sendMail } from "../../emailService.js";

export const companyPackageActivationResendHandler = async (job) => {
    const { email, companyName, planDetailsHtml, discount } = job.data;
    const html = companyPackageActivationResendTemplate(companyName, planDetailsHtml, discount);
    
    await sendMail({
      to: email,
      subject: "QuikChek Account Activation and Package Details - Resend",
      html: html,
    });
};
