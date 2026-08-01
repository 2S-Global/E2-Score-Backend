import { sendMail } from "../../emailService.js";
import { profileSummaryUpdatedTemplate } from "../../templates/profileSummaryUpdatedTemplate.js";

export const profileSummaryUpdatedHandler = async (job) => {
    const { userdtl, to } = job.data;
    const html = profileSummaryUpdatedTemplate(userdtl);



    await sendMail({
        to: to,
        subject: "Your Profile Summary Has Been Updated",
        html: html,
    });
}
