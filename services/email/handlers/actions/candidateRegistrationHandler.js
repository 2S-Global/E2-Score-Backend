import { candidateRegistrationTemplate } from "../../templates/candidateRegistrationTemplate.js";
import { sendMail } from "../../emailService.js";

export const candidateRegistrationHandler = async (job) => {
  const { name, email, password, token } = job.data;
  const html = candidateRegistrationTemplate(name, email, password, token);

  await sendMail({
    type: "registration",
    to: email,
    subject: "Access Credentials for Geisil",
    html: html,
  });
};
