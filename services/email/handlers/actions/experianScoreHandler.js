import { experianScoreTemplate } from "../../templates/experianScoreTemplate.js";
import { sendMail } from "../../emailService.js";

export const experianScoreHandler = async (job) => {
  const { to, userdtl } = job.data;
  const html = experianScoreTemplate(
    userdtl.name,
    userdtl.experianScore,
    userdtl.pdfUrl,
  );
  console.log("TYPE====>", "documents");
  await sendMail({
    type: "documents",
    to: to,
    subject: "Your Latest Experian Credit Score",
    html: html,
  });
};
