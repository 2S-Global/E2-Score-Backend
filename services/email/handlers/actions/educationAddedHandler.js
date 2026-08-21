import { sendMail } from "../../emailService.js";
import { educationAddedTemplate, instituteReferenceTemplate } from "../../templates/educationAddedTemplate.js";
import CompanyDetails from "../../../../models/company_Models/companydetails.js";

export const educationAddedHandler = async (job) => {
    const { userdtl, instituteName, to } = job.data;
    
    // A. Send confirmation email to User
    if (to) {
        const userHtml = educationAddedTemplate(userdtl);
        await sendMail({
        type: "education",
            to: to,
            subject: "Academic Details Added Notification",
            html: userHtml,
        });
    }
    
    // B. Send notification to Company/Institute if applicable
    if (instituteName && typeof instituteName === "string") {
        const escapedInstituteName = instituteName
          .trim()
          .replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");

        const company = await CompanyDetails.findOne({
          name: { $regex: new RegExp(`^${escapedInstituteName}$`, "i") },
          isDel: false,
        });

        if (company?.email) {
            const companyHtml = instituteReferenceTemplate(userdtl, instituteName);
            await sendMail({
        type: "education",
                to: company.email,
                subject: "Candidate Added Your Institute Name",
                html: companyHtml,
            });
        }
    }
}
