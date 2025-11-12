import User from "../../models/userModel.js";
import personalDetails from "../../models/personalDetails.js";
import candidateDetails from "../../models/CandidateDetailsModel.js";
export const test = async (req, res) => {
  try {
    res.status(200).json({ message: "Test route is working!" });
  } catch (error) {
    console.error("Error in test route:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * @description Save the candidate's personal details
 * @route POST /api/candidate/personal/submit_personal_details
 * @security BearerAuth
 * @param {object} req.body - Personal details to save
 * @param {string} req.body.gender - User's gender
 * @param {date} req.body.dob - Date of birth
 * @param {string} req.body.hometown - Hometown
 * @param {string} req.body.category - Category
 * @param {boolean|string} req.body.career_break - Whether the user is currently on career break
 * @param {boolean|string} req.body.currently_on_career_break - Whether the user is currently on career break
 * @param {string|number} req.body.career_break_start_month - Month of the career break start date
 * @param {string|number} req.body.career_break_start_year - Year of the career break start date
 * @param {string|number} req.body.career_break_end_month - Month of the career break end date
 * @param {string|number} req.body.career_break_end_year - Year of the career break end date
 * @param {string} req.body.career_break_reason - Reason for the career break
 * @param {boolean|string} req.body.differently_abled - Whether the user is differently abled
 * @param {string} req.body.disability_type - Type of disability
 * @param {string} req.body.disability_description - Description of the disability
 * @param {string} req.body.workplace_assistance - Type of workplace assistance required
 * @param {string} req.body.usa_visa_type - Type of USA work permit
 * @param {string} req.body.work_permit_other_countries - Other countries with work permit
 * @param {string} req.body.permanent_address - Permanent address
 * @param {string} req.body.pincode - Pincode
 * @param {object[]} req.body.languages - Languages spoken with proficiency level
 * @param {string} req.body.marital_status - Marital status
 * @param {string} req.body.more_info - Additional information
 * @returns {object} 200 - Personal details saved successfully
 * @returns {object} 400 - Validation error
 * @returns {object} 500 - Error saving personal details
 */
export const submitPersonalDetails = async (req, res) => {
  try {
    const data = req.body;
    const userId = req.userId;
    if (data.gender !== undefined) {
      await User.findByIdAndUpdate(userId, { gender: data.gender });
    }

    const languageProficiency = data.languages;

    console.log("Here is my language proficiency: ", languageProficiency);

    if (languageProficiency && Array.isArray(languageProficiency)) {
      for (const lp of languageProficiency) {
        if (lp.language && lp.proficiency) {
          // check at least one of read/write/speak is true
          if (!(lp.read || lp.write || lp.speak)) {
            return res.status(400).json({
              success: false,
              message: "You have to select atleast one option - read, write or speak",
            });
          }
        }
      }
    }

    if (!data.dob) {
      return res
        .status(400)
        .json({ message: "Date of birth (dob) is required." });
    }

    const candidateUpdate = {
      dob: data.dob,
    };
    if (data.hometown !== undefined) {
      candidateUpdate.hometown = data.hometown;
    }
    await candidateDetails.findOneAndUpdate(
      { userId: userId },
      { $set: candidateUpdate },
      { upsert: true, new: true }
    );

    const personalPayload = {
      category: String(data.category),
      careerBreak: data.career_break ? data.career_break : "",
      currentlyOnCareerBreak: data.currently_on_career_break || false,
      startMonth: data.career_break_start_month || "",
      startYear: data.career_break_start_year || "",
      endMonth: data.career_break_end_month || "",
      endYear: data.career_break_end_year || "",
      reason: data.career_break_reason || null,
      differentlyAble: data.differently_abled ? data.differently_abled : "",
      disability_type: data.disability_type || null,
      other_disability_type: data.disability_description || "",
      workplace_assistance: data.workplace_assistance || "",
      usaPermit: data.usa_visa_type,
      workPermitOther: data.work_permit_other_countries,
      permanentAddress: data.permanent_address,
      pincode: data.pincode,
      languageProficiency: (data.languages || []).map((lang) => ({
        language: lang.language,
        proficiency: lang.proficiency,
        read: lang.read || false,
        write: lang.write || false,
        speak: lang.speak || false,
      })),
      maritialStatus: String(data.marital_status),
      partnerName: String(data.partner_name),
      additionalInformation: (data.more_info || []).filter(
        (id) => id && id !== "null" && id !== ""
      ),
      have_usa_visa: data.have_usa_visa || ""
    };

    await personalDetails.findOneAndUpdate(
      { user: userId },
      { $set: personalPayload },
      { upsert: true, new: true }
    );

    res.status(200).json({
      message: "Personal details saved successfully",
      data: personalPayload,
    });
  } catch (error) {
    console.error("Error in submitPersonalDetails:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @description Retrieve the personal details of the authenticated user.
 * @route GET /api/candidate/personal/get_personal_details
 * @access protected
 * @param {Object} req - Express request object containing userId.
 * @param {Object} res - Express response object.
 * @returns {Object} 200 - Returns user's personal details.
 * @returns {Object} 404 - Personal details not found for this user.
 * @returns {Object} 500 - Server error while fetching personal details.
 */
export const getPersonalDetails = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).select("gender");
    const candidate = await candidateDetails
      .findOne({ userId })
      .select("dob hometown");
    const personal = await personalDetails.findOne({ user: userId });

    if (!user && !candidate && !personal) {
      return res
        .status(404)
        .json({ message: "No personal data found for this user." });
    }

    const result = {
      gender: user?.gender || null,
      dob: candidate?.dob || null,
      hometown: candidate?.hometown || null,
      category: personal?.category || null,
      career_break: personal?.careerBreak ?? "",
      currently_on_career_break: personal?.currentlyOnCareerBreak ?? null,
      career_break_start_month: personal?.startMonth || null,
      career_break_start_year: personal?.startYear || null,
      career_break_end_month: personal?.endMonth || null,
      career_break_end_year: personal?.endYear || null,
      career_break_reason: personal?.reason || null,
      differently_abled: personal?.differentlyAble ?? "",
      disability_type: personal?.disability_type || null,
      disability_description: personal?.other_disability_type || null,
      workplace_assistance: personal?.workplace_assistance || null,
      usa_visa_type: personal?.usaPermit || null,
      work_permit_other_countries: personal?.workPermitOther || [],
      permanent_address: personal?.permanentAddress || null,
      pincode: personal?.pincode || null,
      languages: personal?.languageProficiency || [],
      marital_status: personal?.maritialStatus || null,
      partner_name: personal?.partnerName || null,
      more_info: personal?.additionalInformation || [],
      have_usa_visa: personal?.have_usa_visa || false
    };

    res.status(200).json(result);
  } catch (error) {
    console.error("Error in getPersonalDetails:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching personal details" });
  }
};
