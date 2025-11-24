export const resetVerificationFlags = (existingKYC, newData) => {
  const {
    pan_number,
    pan_name,
    cin_number,
    cin_name,
    gstin_number,
    gstin_name,
  } = newData;

  if (
    (pan_number && pan_number !== existingKYC.pan_number) ||
    (pan_name && pan_name !== existingKYC.pan_name)
  ) {
    existingKYC.pan_verified = false;
  }

  if (
    (cin_number && cin_number !== existingKYC.cin_number) ||
    (cin_name && cin_name !== existingKYC.cin_name)
  ) {
    existingKYC.cin_verified = false;
  }

  if (
    (gstin_number && gstin_number !== existingKYC.gstin_number) ||
    (gstin_name && gstin_name !== existingKYC.gstin_name)
  ) {
    existingKYC.gstin_verified = false;
  }
};

export const updateKYCFields = (existingKYC, newData) => {
  const fields = [
    "pan_number",
    "pan_name",
    "cin_number",
    "cin_name",
    "gstin_number",
    "gstin_name",
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
    /* ^[A-Z]{5}[0-9]{4}[A-Z]{1}$ */
    pan_number: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
    gstin_number: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
    cin_number:
      /^([LUu]{1})([0-9]{5})([A-Za-z]{2})([0-9]{4})([A-Za-z]{3})([0-9]{6})$/,
  };

  // 2️⃣ Field groups for required validation
  const validationConfig = [
    {
      fields: ["pan_number", "pan_name"],
      message: "Please fill both the PAN number and name.",
    },
    {
      fields: ["gstin_number", "gstin_name"],
      message: "Please fill both the GSTIN number and name.",
    },
    {
      fields: ["cin_number", "cin_name"],
      message: "Please fill both the CIN number and name.",
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
