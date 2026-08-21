import { userCredentialsTemplate } from "../../templates/userCredentialsTemplate.js";
import { sendMail } from "../../emailService.js";

export const userCredentialsHandler = async (job) => {
    const { name, email, password, token } = job.data;
    const html = userCredentialsTemplate(name, email, password, token);
    
    await sendMail({
        type: "registration",
      to: email,
      subject: "Access Credentials for Geisil",
      html: html,
    });
};
