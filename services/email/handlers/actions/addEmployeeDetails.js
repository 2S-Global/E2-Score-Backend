import { htmlTemplate } from "../../templates/employeeCardTemplate.js";
import { sendMail } from "../../emailService.js";

export const addEmployeeDetailsHandler = async (job) => {
    const { user, job_title, to } = job.data;
    const html = htmlTemplate(user, job_title)
    await sendMail({
        type: "experience",
        to: to,
        subject: "Employment Updated In Your Company",
        html: html,
    });
}