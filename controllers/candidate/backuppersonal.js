import User from "../../models/userModel.js";
import personalDetails from "../../models/personalDetails.js";
import candidateDetails from "../../models/CandidateDetailsModel.js";

import {
  getColumnValueById,
  getCountryNamesByIds,
  formatLanguageDetails,
  getMoreInfoNames,
  formatUserData,
} from "../../utility/helper/giveIDgetname.js";

const getMonthName = (monthNumber) => {
  const monthIndex = parseInt(monthNumber, 10) - 1;
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return monthNames[monthIndex] || "";
};

export const getPersonalDetailsWithName = async (req, res) => {
  try {
    const userId = req.userId;

    const [user, candidate, personal] = await Promise.all([
      User.findById(userId).select("gender"),
      candidateDetails.findOne({ userId }).select("dob hometown"),
      personalDetails.findOne({ user: userId }),
    ]);

    if (!user || !candidate || !personal) {
      return res
        .status(404)
        .json({ message: "Personal details not found for this user." });
    }

    const [
      gender,
      category,
      disabilityType,
      usaVisaType,
      workPermitCountries,
      maritalStatus,
      moreInfo,
      languages,
      career_break_reason,
    ] = await Promise.all([
      getColumnValueById("gender", user.gender, "name"),
      getColumnValueById("category", personal.category, "category_name"),
      getColumnValueById("disability_type", personal.disability_type, "name"),
      getColumnValueById("visa_type", personal.usaPermit, "visa_name"),
      getCountryNamesByIds(personal.workPermitOther),
      getColumnValueById("marital_status", personal.maritialStatus, "status"),
      getMoreInfoNames(personal.additionalInformation || []),
      formatLanguageDetails(personal.languageProficiency || []),
      getColumnValueById("career_break_reason", personal.reason, "name"),
    ]);

    const result = {
      gender,
      dob: candidate.dob,
      hometown: candidate.hometown,
      category,
      career_break: personal?.careerBreak ?? "",
      currently_on_career_break: personal.currentlyOnCareerBreak ?? false,
      career_break_start_month: getMonthName(personal.startMonth),
      career_break_start_year: personal.startYear,
      career_break_end_month: getMonthName(personal.endMonth),
      career_break_end_year: personal.endYear,
      career_break_reason: career_break_reason,
      differently_abled: personal?.differentlyAble ?? "",
      disability_type: disabilityType,
      disability_description: personal.other_disability_type,
      workplace_assistance: personal.workplace_assistance,
      usa_visa_type: usaVisaType,
      work_permit_other_countries: workPermitCountries,
      permanent_address: personal.permanentAddress,
      pincode: personal.pincode,
      languages,
      marital_status: maritalStatus,
      more_info: moreInfo,
    };

    res.status(200).json({ data: formatUserData(result), raw: result });
  } catch (error) {
    console.error("Error in getPersonalDetailsWithName:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching personal details" });
  }
};
