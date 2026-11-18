import { vendorAssociationTemplate } from "../../templates/vendorAssociationTemplate.js";
import { sendMail } from "../../emailService.js";

export const vendorAssociationHandler = async (job) => {
  const { name, email, companyName } = job.data;
  if (!name || !email || !companyName) {
    throw new Error(`Invalid payload for job ${job.id}: missing vendor association details`);
  }

  await sendMail({
    type: "registration",
    to: email,
    subject: `${companyName} added you as a vendor`,
    html: vendorAssociationTemplate(name, companyName),
  });
};
