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
