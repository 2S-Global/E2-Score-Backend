import { instituteStudentImportCredentialsTemplate } from "../../templates/instituteStudentImportCredentialsTemplate.js";
import { sendMail } from "../../emailService.js";

export const instituteStudentImportCredentialsHandler = async (job) => {
    const { name, email, password } = job.data;
    const html = instituteStudentImportCredentialsTemplate(name, email, password);
    
    await sendMail({
      to: email,
      subject: "Access Credentials for Geisil",
      html: html,
    });
};
