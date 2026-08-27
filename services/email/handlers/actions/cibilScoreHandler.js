import { cibilScoreTemplate } from "../../templates/cibilScoreTemplate.js";
import { sendMail } from "../../emailService.js";

export const cibilScoreHandler = async (job) => {
  const { to, userdtl } = job.data;
  const html = cibilScoreTemplate(userdtl.name, userdtl.cibilScore);
  console.log("TYPE====>", "documents");
  await sendMail({
    type: "documents",
    to: to,
    subject: "Your Latest CIBIL Credit Score",
    html: html,
  });
};
