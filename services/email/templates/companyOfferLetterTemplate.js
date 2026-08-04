export const companyOfferLetterTemplate = (userName, offer_letter_designation, companyName, offer_letter_joining_date_string, offer_letter_salary, offer_letter_message) => {
  return `
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://api.geisil.com/upload/job_offer.jpg" alt="Banner" style="width: 100%; height: auto;" />
        </div>
 
        <p>Dear ${userName || "Candidate"},</p>

        <p>
          We are pleased to extend an offer of employment to you for the position of
          <strong>${offer_letter_designation}</strong> at <strong>${companyName}</strong>.
        </p>

        <p>
          <strong>Offer Details:</strong><br />
          <strong>Designation:</strong> ${offer_letter_designation}<br />
          <strong>Proposed Joining Date:</strong> ${offer_letter_joining_date_string}<br />
          <strong>Salary:</strong> ₹${offer_letter_salary}
        </p>

        ${offer_letter_message
          ? `<p>${offer_letter_message}</p>`
          : ""
        }

        <br />
        <p>Best regards,</p>
        <p><strong>HR Team</strong></p>
        <p>${companyName}</p>
      `;
};
