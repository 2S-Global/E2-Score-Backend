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

  if (aadhar_number && aadhar_number !== existingKYC.aadhar_number) {
    existingKYC.aadhar_verified = false;
  }
};

export const updateKYCFields = (existingKYC, newData) => {
  Object.assign(existingKYC, {
    pan_number: newData.pan_number,
    pan_name: newData.pan_name,
    epic_number: newData.epic_number,
    epic_name: newData.epic_name,
    passport_name: newData.passport_name,
    passport_number: newData.passport_number,
    passport_dob: newData.passport_dob,
    dl_number: newData.dl_number,
    dl_name: newData.dl_name,
    dl_dob: newData.dl_dob,
    aadhar_number: newData.aadhar_number,
  });
};

export const validateKYCData = (formData) => {
  // 1️⃣ Regex patterns for format validation
  const regexPatterns = {
    pan_number: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
    epic_number: /^[A-Z]{3}[0-9]{7}$/,
    //  passport_number: /^[A-PR-WYa-pr-wy][1-9][0-9]{6}$/,
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
      fields: ["aadhar_number"],
      message: "Please fill a valid Aadhar number.",
    },
  ];

  const errors = [];

  // 3️⃣ Regex validation
  for (const field in regexPatterns) {
    if (formData[field]) {
      if (!regexPatterns[field].test(formData[field])) {
        errors.push(`Invalid format for ${field}`);
      }
    }
  }

  // 4️⃣ Group-based required validation
  let hasAnyGroupFilled = false;

  for (const { fields, message } of validationConfig) {
    const isAnyFilled = fields.some(
      (field) => formData[field]?.toString().trim() !== ""
    );

    if (isAnyFilled) {
      hasAnyGroupFilled = true;

      const isAllFilled = fields.every(
        (field) => formData[field]?.toString().trim() !== ""
      );

      if (!isAllFilled) {
        errors.push(message);
      }
    }
  }

  if (!hasAnyGroupFilled) {
    errors.push("Please fill at least one document.");
  }

  return errors; // returns an array of all errors
};
