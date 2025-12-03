import nodemailer from "nodemailer";
export const resetVerificationFlags = (existingKYC, newData) => {
  const {
    pan_number,
    pan_name,
    epic_number,
    epic_name,
    passport_name,
    passport_number,
    passport_dob,
    dl_number,
    dl_name,
    dl_dob,
    aadhar_number,
    aadhar_name,
  } = newData;

  if (
    (pan_number && pan_number !== existingKYC.pan_number) ||
    (pan_name && pan_name !== existingKYC.pan_name)
  ) {
    existingKYC.pan_verified = false;
  }

  if (
    (epic_number && epic_number !== existingKYC.epic_number) ||
    (epic_name && epic_name !== existingKYC.epic_name)
  ) {
    existingKYC.epic_verified = false;
  }

  if (
    (passport_number && passport_number !== existingKYC.passport_number) ||
    (passport_name && passport_name !== existingKYC.passport_name) ||
    (passport_dob &&
      new Date(passport_dob).toISOString() !==
        existingKYC.passport_dob?.toISOString())
  ) {
    existingKYC.passport_verified = false;
  }

  if (
    (dl_number && dl_number !== existingKYC.dl_number) ||
    (dl_name && dl_name !== existingKYC.dl_name) ||
    (dl_dob &&
      new Date(dl_dob).toISOString() !== existingKYC.dl_dob?.toISOString())
  ) {
    existingKYC.dl_verified = false;
  }

  if (
    (aadhar_number && aadhar_number !== existingKYC.aadhar_number) ||
    (aadhar_name && aadhar_name !== existingKYC.aadhar_name)
  ) {
    existingKYC.aadhar_verified = false;
  }
};

export const updateKYCFields = (existingKYC, newData) => {
  const fields = [
    "pan_number",
    "pan_name",
    "epic_number",
    "epic_name",
    "passport_name",
    "passport_number",
    "passport_dob",
    "dl_number",
    "dl_name",
    "dl_dob",
    "aadhar_number",
    "aadhar_name",
  ];

  fields.forEach((field) => {
    if (field in newData) {
      existingKYC[field] = newData[field]; // accepts "" as valid
    }
  });
};

export const validateKYCData = (formData) => {
  // 1️⃣ Regex patterns for format validation
  const regexPatterns = {
    pan_number: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
    epic_number: /^[A-Z]{3}[0-9]{7}$/,
    // passport_number: /^[A-PR-WYa-pr-wy][1-9][0-9]{6}$/, // Uncomment if needed
    dl_number: /^[A-Z]{2}[0-9]{2}[0-9]{4}[0-9]{7}$/,
    aadhar_number: /^\d{12}$/,
  };

  // 2️⃣ Field groups for required validation
  const validationConfig = [
    {
      fields: ["pan_number", "pan_name"],
      message: "Please fill both the PAN number and name.",
    },
    {
      fields: ["epic_number", "epic_name"],
      message: "Please fill both the EPIC number and name.",
    },
    {
      fields: ["passport_number", "passport_name", "passport_dob"],
      message: "Please fill Passport number, name, and DOB.",
    },
    {
      fields: ["dl_number", "dl_name", "dl_dob"],
      message: "Please fill Driving License number, name, and DOB.",
    },
    {
      fields: ["aadhar_number", "aadhar_name"],
      message: "Please fill both the Aadhar number and name.",
    },
  ];

  const errors = [];

  // Helper: check if field is non-empty
  const isNonEmpty = (val) =>
    val !== undefined && val !== null && val.toString().trim() !== "";

  let hasAnyGroupFilled = false;

  // 3️⃣ Group-based required + regex validation
  for (const { fields, message } of validationConfig) {
    const isAnyFilled = fields.some((field) => isNonEmpty(formData[field]));

    if (isAnyFilled) {
      hasAnyGroupFilled = true;

      const isAllFilled = fields.every((field) => isNonEmpty(formData[field]));

      if (!isAllFilled) {
        errors.push(message);
      } else {
        // Run regex validation only if the group is complete
        for (const field of fields) {
          if (
            regexPatterns[field] &&
            !regexPatterns[field].test(formData[field])
          ) {
            errors.push(`Invalid format for ${field.replace(/_/g, " ")}`);
          }
        }
      }
    }
  }

  // 4️⃣ At least one group must be filled
  if (!hasAnyGroupFilled) {
    errors.push("Please fill at least one document.");
  }

  return errors; // returns an array of all errors
};

export const Sendemail = async (user, existingKYC, newData) => {
  console.log("📧 Sending email...");
  console.log("User:", user.name, "Email:", user.email);

  const {
    pan_number,
    pan_name,
    epic_number,
    epic_name,
    passport_name,
    passport_number,
    passport_dob,
    dl_number,
    dl_name,
    dl_dob,
    aadhar_number,
    aadhar_name,
  } = newData;

  let list = [];

  // -----------------------
  // UPDATE FLOW
  // -----------------------
  if (existingKYC) {
    if (
      (pan_number && pan_number !== existingKYC.pan_number) ||
      (pan_name && pan_name !== existingKYC.pan_name)
    ) {
      list.push("PAN");
    }

    if (
      (epic_number && epic_number !== existingKYC.epic_number) ||
      (epic_name && epic_name !== existingKYC.epic_name)
    ) {
      list.push("Epic");
    }

    if (
      (passport_number && passport_number !== existingKYC.passport_number) ||
      (passport_name && passport_name !== existingKYC.passport_name) ||
      (passport_dob &&
        new Date(passport_dob).toISOString() !==
          existingKYC.passport_dob?.toISOString())
    ) {
      list.push("Passport");
    }

    if (
      (dl_number && dl_number !== existingKYC.dl_number) ||
      (dl_name && dl_name !== existingKYC.dl_name) ||
      (dl_dob &&
        new Date(dl_dob).toISOString() !== existingKYC.dl_dob?.toISOString())
    ) {
      list.push("Driving License");
    }

    if (
      (aadhar_number && aadhar_number !== existingKYC.aadhar_number) ||
      (aadhar_name && aadhar_name !== existingKYC.aadhar_name)
    ) {
      list.push("Aadhar");
    }
  }

  // -----------------------
  // CREATE FLOW
  // -----------------------
  else {
    if (newData.pan_number) list.push("PAN");
    if (newData.epic_number) list.push("Epic");
    if (newData.passport_number) list.push("Passport");
    if (newData.dl_number) list.push("Driving License");
    if (newData.aadhar_number) list.push("Aadhar");
  }

  // If no changes, don't send email
  if (list.length === 0) {
    console.log("⚠️ No KYC changes detected. Email not sent.");
    return;
  }

  const changeListHTML = `
    ${list.map((item) => `<li><strong>${item}</strong></li>`).join("")}
  `;

  const htmlEmail = `
  <div style="font-family: Arial, sans-serif; color:#333; padding:20px; line-height:1.6; max-width:600px; margin:auto; background:#f9f9f9; border-radius:8px;">
    
    <div style="background:#0052cc; padding:15px 20px; border-radius:8px 8px 0 0;">
      <h2 style="color:#fff; margin:0; font-size:20px;">KYC Update Notification</h2>
    </div>

    <div style="padding:20px; background:#ffffff; border-radius:0 0 8px 8px;">
      <p>Dear <strong>${user.name}</strong>,</p>
          
      <p>The following information in your <strong>KYC</strong> was updated:</p>
          
      <ul>
        ${changeListHTML}
      </ul>

      <p>If you did not make this change, please contact support immediately.</p>

      <p>You can access your dashboard using the link below:</p>

      <p>
        <a href="${process.env.ORIGIN}" 
          style="background:#0052cc; color:#fff; padding:10px 16px; text-decoration:none; border-radius:5px; display:inline-block;">
          Visit Dashboard
        </a>
      </p>

      <p>If the button does not work, use this link:</p>
      <p><a href="${process.env.ORIGIN}" style="color:#0052cc;">${process.env.ORIGIN}</a></p>

      <br />

      <p>Sincerely,<br />
      <strong>Geisil Admin Team</strong></p>
    </div>
  </div>
  `;

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Geisil Team" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: "Profile Update Notification",
    html: htmlEmail,
  };

  await transporter.sendMail(mailOptions);
};
