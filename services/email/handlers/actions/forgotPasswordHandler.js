import { forgotPasswordTemplate } from "../../templates/forgotPasswordTemplate.js";
import { sendMail } from "../../emailService.js";

export const forgotPasswordHandler = async (job) => {
    const { name, email, newPassword } = job.data;
    const html = forgotPasswordTemplate(name, newPassword);
    
    await sendMail({
        type: "password",
      to: email,
      subject: "Password Reset Successful - Action Required",
      html: html,
    });
};
