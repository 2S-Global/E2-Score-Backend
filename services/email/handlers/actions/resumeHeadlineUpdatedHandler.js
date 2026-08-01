import { sendMail } from "../../emailService.js";
import { resumeHeadlineUpdatedTemplate } from "../../templates/resumeHeadlineUpdatedTemplate.js";

export const resumeHeadlineUpdatedHandler = async (job) => {
    const { userdtl, to } = job.data;
    const html = resumeHeadlineUpdatedTemplate(userdtl);
    
    await sendMail({
        to: to,
        subject: "Your Resume Headline Has Been Updated",
        html: html,
    });
}
