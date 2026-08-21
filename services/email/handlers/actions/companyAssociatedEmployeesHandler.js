import { companyAssociatedEmployeesTemplate } from "../../templates/companyAssociatedEmployeesTemplate.js";
import { sendMail } from "../../emailService.js";

export const companyAssociatedEmployeesHandler = async (job) => {
  const { email, employeeListHtml } = job.data;
  const html = companyAssociatedEmployeesTemplate(employeeListHtml);

  await sendMail({
    type: "experience",
    to: email,
    subject: "Employment Verification Status Updated",
    html: html,
  });
};
