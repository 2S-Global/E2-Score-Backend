import axios from "axios";

function convertDateFormat(dateString) {
  const date = new Date(dateString);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // months are 0-based
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
}

/**
 * PAN Verification with Zoop
 */
export const verifyPanWithZoop = async (
  kyc,
  Zoop_URL,
  zoopAppId,
  zoopApiKey
) => {
  if (!kyc.pan_number || !kyc.pan_name) {
    return { success: false, message: "PAN number or name is missing" };
  }

  const panData = {
    mode: "sync",
    data: {
      customer_pan_number: kyc.pan_number,
      pan_holder_name: kyc.pan_name,
      consent: "Y",
      consent_text:
        "I hereby declare my consent agreement for fetching my information via ZOOP API",
    },
    task_id: process.env.PAN_TASK_ID,
  };

  try {
    const response = await axios.post(
      `${Zoop_URL}/api/v1/in/identity/pan/lite`,
      panData,
      {
        headers: {
          "app-id": zoopAppId,
          "api-key": zoopApiKey,
          "Content-Type": "application/json",
        },
      }
    );

    kyc.pan_response = response.data;

    // Verify PAN name
    if (
      response.data?.result?.user_full_name?.trim().toLowerCase() ===
      kyc.pan_name?.trim().toLowerCase()
    ) {
      kyc.pan_verified = true;
    } else {
      kyc.pan_verified = false;
    }

    await kyc.save();

    return {
      success: kyc.pan_verified,
      message: kyc.pan_verified
        ? " PAN verification successful. Provided name matches official records."
        : " PAN verification failed. Provided name does not match official records.",
      response: response.data,
    };
  } catch (error) {
    kyc.pan_response = error.response?.data || { error: error.message };
    kyc.pan_verified = false;
    await kyc.save();

    return {
      success: false,
      message:
        "⚠️ PAN verification request failed due to a technical error. Please try again later.",
      error: error.response?.data || error.message,
    };
  }
};

/**
 * EPIC Verification (stub)
 */
export const verifyEpicWithZoop = async (
  kyc,
  Zoop_URL,
  zoopAppId,
  zoopApiKey
) => {
  if (!kyc.epic_number || !kyc.epic_name) {
    return { success: false, message: "EPIC number or name is missing" };
  }

  const epicData = {
    data: {
      customer_epic_number: kyc.epic_number,
      name_to_match: kyc.epic_name,
      consent: "Y",
      consent_text:
        "I hereby declare my consent agreement for fetching my information via ZOOP API",
    },
    task_id: process.env.EPIC_TASK_ID,
  };

  try {
    const response = await axios.post(
      `${Zoop_URL}/api/v1/in/identity/voter/advance`,
      epicData,
      {
        headers: {
          "app-id": zoopAppId,
          "api-key": zoopApiKey,
          "Content-Type": "application/json",
        },
      }
    );

    kyc.epic_response = response.data;

    // Verify EPIC name
    const epicName = kyc.epic_name?.trim().toLowerCase();

    const apiNameEnglish = response.data?.result?.user_name_english
      ?.trim()
      .toLowerCase();
    const apiNameVernacular = response.data?.result?.user_name_vernacular
      ?.trim()
      .toLowerCase();

    if (
      epicName &&
      (epicName === apiNameEnglish || epicName === apiNameVernacular)
    ) {
      kyc.epic_verified = true;
    } else {
      kyc.epic_verified = false;
    }

    await kyc.save();

    return {
      success: kyc.epic_verified,
      message: kyc.epic_verified
        ? " EPIC verification successful. Provided name matches official records."
        : " EPIC verification failed. Provided name does not match official records.",
      response: response.data,
    };
  } catch (error) {
    kyc.epic_response = error.response?.data || { error: error.message };
    kyc.epic_verified = false;
    await kyc.save();

    return {
      success: false,
      message:
        "⚠️ EPIC verification request failed due to a technical error. Please try again later.",
      error: error.response?.data || error.message,
    };
  }
};

/**
 * Passport Verification (stub)
 */
export const verifyPassportWithZoop = async (
  kyc,
  Zoop_URL,
  zoopAppId,
  zoopApiKey
) => {
  if (!kyc.passport_number || !kyc.passport_name || !kyc.passport_dob) {
    return {
      success: false,
      message: "EPIC number or name or date of birth is missing",
    };
  }

  const passportData = {
    mode: "sync",
    data: {
      customer_file_number: kyc.passport_number,
      name_to_match: kyc.passport_name,
      customer_dob: convertDateFormat(kyc.passport_dob),
      consent: "Y",
      consent_text:
        "I hereby declare my consent agreement for fetching my information via ZOOP API",
    },
    task_id: process.env.PASSPORT_TASK_ID,
  };

  try {
    const response = await axios.post(
      `${Zoop_URL}/api/v1/in/identity/passport/advance`,
      passportData,
      {
        headers: {
          "app-id": zoopAppId,
          "api-key": zoopApiKey,
          "Content-Type": "application/json",
        },
      }
    );

    kyc.passport_response = response.data;

    // Verify Passprt name and date of birth
    const passportName = kyc.passport_name?.trim().toLowerCase();
    const passportDob = convertDateFormat(kyc.passport_dob);

    const firstName =
      response.data?.result?.name_on_passport?.trim().toLowerCase() || "";
    const lastName =
      response.data?.result?.customer_last_name?.trim().toLowerCase() || "";

    const apipassportName = `${firstName} ${lastName}`.trim();
    const apiDob = response.data?.result?.customer_dob?.trim() || "";

    if (
      passportName &&
      passportDob &&
      apiDob &&
      (passportName === apipassportName || passportName === firstName) &&
      passportDob === apiDob
    ) {
      kyc.passport_verified = true;
    } else {
      kyc.passport_verified = false;
    }

    await kyc.save();

    return {
      success: kyc.passport_verified,
      message: kyc.passport_verified
        ? " Passport verification successful. Provided details matches official records."
        : " Passport verification failed. Provided details does not match official records.",
      response: response.data,
    };
  } catch (error) {
    kyc.passport_response = error.response?.data || { error: error.message };
    kyc.passport_verified = false;
    await kyc.save();

    return {
      success: false,
      message:
        "⚠️ Passport verification request failed due to a technical error. Please try again later.",
      error: error.response?.data || error.message,
    };
  }
};

/**
 * Driving License Verification (stub)
 */
export const verifyDLWithZoop = async (
  kyc,
  Zoop_URL,
  zoopAppId,
  zoopApiKey
) => {
  if (!kyc.dl_number || !kyc.dl_name || !kyc.dl_dob) {
    return {
      success: false,
      message: "Driving License number or name or date of birth is missing",
    };
  }

  const dlData = {
    mode: "sync",
    data: {
      customer_dl_number: kyc.dl_number,
      name_to_match: kyc.dl_name,
      customer_dob: convertDateFormat(kyc.dl_dob),
      consent: "Y",
      consent_text:
        "I hereby declare my consent agreement for fetching my information via ZOOP API",
    },
    task_id: process.env.DL_TASK_ID,
  };

  try {
    const response = await axios.post(
      `${Zoop_URL}/api/v1/in/identity/dl/advance`,
      dlData,
      {
        headers: {
          "app-id": zoopAppId,
          "api-key": zoopApiKey,
          "Content-Type": "application/json",
        },
      }
    );

    kyc.dl_response = response.data;

    // Verify dl name and date of birth
    const dlName = kyc.dl_name?.trim().toLowerCase();
    const dlDob = convertDateFormat(kyc.dl_dob); // DD-MM-YYYY

    const apiDlName =
      response.data?.result?.user_full_name?.trim().toLowerCase() || "";
    const apiDob = response.data?.result?.user_dob?.trim() || ""; // Already DD-MM-YYYY

    if (dlName && dlDob && dlName === apiDlName && dlDob === apiDob) {
      kyc.dl_verified = true;
    } else {
      kyc.dl_verified = false;
    }

    await kyc.save();

    return {
      success: kyc.dl_verified,
      message: kyc.dl_verified
        ? " Driving License verification successful. Provided details matches official records."
        : " Driving License verification failed. Provided details does not match official records.",
      response: response.data,
    };
  } catch (error) {
    kyc.dl_response = error.response?.data || { error: error.message };
    kyc.dl_verified = false;
    await kyc.save();

    return {
      success: false,
      message:
        "⚠️ Driving License verification request failed due to a technical error. Please try again later.",
      error: error.response?.data || error.message,
    };
  }
};

/**
 * Aadhaar Verification (stub)
 */
export const verifyAadhaarWithZoop = async (kyc, Aadhar_URL, aadharKey) => {
  if (!kyc.aadhar_number || !kyc.aadhar_name) {
    return {
      success: false,
      message: "Aadhaar number or name is missing",
    };
  }

  const headers = {
    "Content-Type": "application/json",
  };

  try {
    const response = await axios.post(
      `${Aadhar_URL}/api/v1/aadhaar-v2/generate-otp`,
      {
        key: aadharKey,
        id_number: kyc.aadhar_number,
      },
      { headers }
    );

    kyc.aadhar_response = response.data;

    await kyc.save();

    return {
      success: true,
      message: "Aadhaar verification OTP sent successfully.",
      response: response.data,
    };
  } catch (error) {
    kyc.aadhar_response = error.response?.data || { error: error.message };

    await kyc.save();

    return {
      success: false,
      message:
        "⚠️ Aadhaar verification request failed due to a technical error. Please try again later.",
      error: error.response?.data || error.message,
    };
  }
};

/**
 * gstin Verification with Zoop
 */
export const verifygstinWithZoop = async (
  kyc,
  Zoop_URL,
  zoopAppId,
  zoopApiKey
) => {
  if (!kyc.gstin_number || !kyc.gstin_name) {
    return { success: false, message: "GSTIN number or name is missing" };
  }

  const gstinData = {
    mode: "sync",
    data: {
      business_gstin_number: kyc.gstin_number,
      consent: "Y",
      consent_text:
        "I hereby declare my consent agreement for fetching my information via ZOOP API",
    },
    task_id: process.env.GSTIN_TASK_ID,
  };

  try {
    const response = await axios.post(
      `${Zoop_URL}/api/v1/in/merchant/gstin/lite`,
      gstinData,
      {
        headers: {
          "app-id": zoopAppId,
          "api-key": zoopApiKey,
          "Content-Type": "application/json",
        },
      }
    );

    kyc.gstin_response = response.data;

    // Verify PAN name
    if (
      response.data?.result?.legal_name?.trim().toLowerCase() ===
      kyc.gstin_name?.trim().toLowerCase()
    ) {
      kyc.gstin_verified = true;
    } else {
      kyc.gstin_verified = false;
    }

    await kyc.save();

    return {
      success: kyc.gstin_verified,
      message: kyc.gstin_verified
        ? " GSTIN verification successful. Provided name matches official records."
        : " GSTIN verification failed. Provided name does not match official records.",
      response: response.data,
    };
  } catch (error) {
    kyc.gstin_response = error.response?.data || { error: error.message };
    kyc.gstin_verified = false;
    await kyc.save();

    return {
      success: false,
      message:
        "⚠️ GSTIN verification request failed due to a technical error. Please try again later.",
      error: error.response?.data || error.message,
    };
  }
};

/**
 * cin Verification with Zoop
 */
export const verifycinWithZoop = async (
  kyc,
  Zoop_URL,
  zoopAppId,
  zoopApiKey
) => {
  if (!kyc.cin_number || !kyc.cin_name) {
    return { success: false, message: "CIN number or name is missing" };
  }

  const cinData = {
    mode: "sync",
    data: {
      cin_number: kyc.cin_number,
      consent: "Y",
      consent_text:
        "I hereby declare my consent agreement for fetching my information via ZOOP API",
    },
    task_id: process.env.CIN_TASK_ID,
  };

  try {
    const response = await axios.post(
      `${Zoop_URL}/api/v1/in/merchant/cin/advance`,
      cinData,
      {
        headers: {
          "app-id": zoopAppId,
          "api-key": zoopApiKey,
          "Content-Type": "application/json",
        },
      }
    );

    kyc.cin_response = response.data;

    const fetchedName =
      response?.data?.result?.company_info?.company_name ?? "";
    const inputName = kyc.cin_name ?? "";

    const nameMatches =
      fetchedName.trim().toLowerCase() === inputName.trim().toLowerCase();

    kyc.cin_verified = nameMatches;

    await kyc.save();

    return {
      success: kyc.cin_verified,
      message: kyc.cin_verified
        ? " CIN verification successful. Provided name matches official records."
        : " CIN verification failed. Provided name does not match official records.",
      response: response.data,
    };
  } catch (error) {
    kyc.cin_response = error.response?.data || { error: error.message };
    kyc.cin_verified = false;
    await kyc.save();

    return {
      success: false,
      message:
        "⚠️ CIN verification request failed due to a technical error. Please try again later.",
      error: error.response?.data || error.message,
    };
  }
};
