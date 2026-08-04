export const companyOfferSentNotificationTemplate = (designation, userName, userEmail, offer_letter_designation, offer_letter_joining_date_string, offer_letter_salary) => {
  return `
    <h2>Offer Letter Sent Notification</h2>

    <p>
      An offer letter has been successfully sent to a candidate for the position:
    </p>

    <p><strong>Job Title:</strong> ${designation}</p>

    <h3>Candidate Details</h3>
    <table cellpadding="6" cellspacing="0" border="0">
      <tr>
        <td><strong>Name</strong></td>
        <td>${userName || "N/A"}</td>
      </tr>
      <tr>
        <td><strong>Email</strong></td>
        <td>${userEmail}</td>
      </tr>
    </table>

    <br/>

    <h3>Offer Details</h3>
    <p>
      <strong>Designation:</strong> ${offer_letter_designation}<br/>
      <strong>Joining Date:</strong> ${offer_letter_joining_date_string}<br/>
      <strong>Salary:</strong> ₹${offer_letter_salary}
    </p>

    <br/>
    <p>— System Notification</p>
  `;
};
