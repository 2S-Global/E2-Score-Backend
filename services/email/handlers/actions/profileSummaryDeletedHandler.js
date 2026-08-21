import { sendMail } from "../../emailService.js";
import { profileSummaryDeletedTemplate } from "../../templates/profileSummaryDeletedTemplate.js";

export const profileSummaryDeletedHandler = async (job) => {
    const { userdtl, to } = job.data;
    const html = profileSummaryDeletedTemplate(userdtl);
    
    await sendMail({
        type: "profile",
        to: to,
        subject: "Your Profile Summary Has Been Deleted",
        html: html,
    });
}
