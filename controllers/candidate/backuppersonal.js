import User from "../../models/userModel.js";
import personalDetails from "../../models/personalDetails.js";
import candidateDetails from "../../models/CandidateDetailsModel.js";
import list_tbl_countrie from "../../models/monogo_query/countriesModel.js";

import {
  getColumnValueById,
  getCountryNamesByIds,
  formatLanguageDetails,
  getMoreInfoNames,
  formatUserData,
} from "../../utility/helper/mongogiveIDgetname.js";

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
      getColumnValueById("list_gender", user.gender, "name"),
      getColumnValueById("list_category", personal.category, "category_name"),
      getColumnValueById(
        "list_disability_type",
        personal.disability_type,
        "name"
      ),
      getColumnValueById("list_visa_type", personal.usaPermit, "visa_name"),
      // getCountryNamesByIds(personal.workPermitOther),
      personal.workPermitOther && personal.workPermitOther.length > 0
        ? (
          await list_tbl_countrie.find({ id: { $in: personal.workPermitOther } })
        ).map(c => c.name).join(", ")
        : "",
      getColumnValueById(
        "list_marital_status",
        personal.maritialStatus,
        "status"
      ),
      getMoreInfoNames(personal.additionalInformation || []),
      formatLanguageDetails(personal.languageProficiency || []),
      getColumnValueById("list_career_break_reason", personal.reason, "name"),
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
      partner_name: personal?.partnerName ?? "",
      more_info: moreInfo,
    };

    res.status(200).json({ data: formatUserData(result) /* , raw: result  */ });
  } catch (error) {
    console.error("Error in getPersonalDetailsWithName:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching personal details" });
  }
};
