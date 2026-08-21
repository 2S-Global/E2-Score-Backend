import { sendMail } from "../../emailService.js";
import { keySkillsUpdatedTemplate } from "../../templates/keySkillsUpdatedTemplate.js";

export const keySkillsUpdatedHandler = async (job) => {
    const { userdtl, to } = job.data;
    const html = keySkillsUpdatedTemplate(userdtl);
    
    await sendMail({
        type: "skills",
        to: to,
        subject: "Your Key Skill List Has Been Updated",
        html: html,
    });
}
