import { companyPackageActivationTemplate } from "../../templates/companyPackageActivationTemplate.js";
import { sendMail } from "../../emailService.js";

export const companyPackageActivationHandler = async (job) => {
    const { email, companyName, planDetailsHtml, discount } = job.data;
    const html = companyPackageActivationTemplate(companyName, planDetailsHtml, discount);
    
    await sendMail({
        type: "verification",
      to: email,
      subject: "QuikChek Account Activation and Package Details",
      html: html,
    });
};
