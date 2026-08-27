export const cibilScoreTemplate = (name, cibilScore) => `
  <div style="text-align: center; margin-bottom: 20px;">
    <img 
      src="${process.env.EMAIL_HEADER_LOGO_URL || "https://services.geisil.com/assets/Logo-D7c9kIlT.webp"}" 
      alt="Global Employability Information Services India Limited" 
      style="width: 100%; height: auto;" 
    />
  </div>

  <p>Dear <strong>${name}</strong>,</p>

  <p>
    We are pleased to share your latest CIBIL Score as requested.
  </p>

  <div style="
    text-align: center;
    margin: 25px 0;
    padding: 20px;
    background-color: #f5f8fc;
    border-radius: 8px;
  ">
    <p style="margin: 0 0 10px; font-size: 16px; color: #555;">
      Your CIBIL Score
    </p>
    <p style="
      margin: 0;
      font-size: 36px;
      font-weight: bold;
      color: #1a73e8;
    ">
      ${cibilScore}
    </p>
  </div>

  <p>
    Your CIBIL Score is an important indicator of your creditworthiness and
    may be considered by lenders when evaluating your credit applications.
  </p>

  <p>
    Please review your credit information carefully. If you have any questions
    or notice any discrepancies, please contact our support team for assistance.
  </p>

  <p>
    Thank you for choosing <strong>Global Employability Information Services India Limited</strong>.
  </p>

  <br />

  <p>
    Sincerely,<br />
    <strong>Global Employability Information Services India Limited</strong><br />
    Support Team
  </p>
`;
