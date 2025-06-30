import db_sql from "../../config/sqldb.js";
import mongoose from "mongoose";
import list_gender from "../../models/monogo_query/genderModel.js";
import list_category from "../../models/monogo_query/categoryModel.js";
import list_disability_type from "../../models/monogo_query/disabilityType.js";
import list_visa_type from "../../models/monogo_query/visaTypeModel.js";
import list_tbl_countrie from "../../models/monogo_query/countriesModel.js";
import list_marital_status from "../../models/monogo_query/maritalStatusModel.js";
import list_more_information from "../../models/monogo_query/moreInformationModel.js";
import list_language from "../../models/monogo_query/languageModel.js";
import list_language_proficiency from "../../models/monogo_query/languageProficiencyModel.js";
import list_career_break_reason from "../../models/monogo_query/careerBreakReasonModel.js";
const isValidField = (str) => /^[a-zA-Z0-9_]+$/.test(str);

const modelMap = {
  list_gender,
  list_category,
  list_disability_type,
  list_visa_type,
  list_tbl_countrie,
  list_marital_status,
  list_more_information,
  list_language,
  list_language_proficiency,
  list_career_break_reason,
};

export const getColumnValueById = async (modelName, idString, field_name) => {
  try {
    if (!modelName || !idString || !field_name) return null;
    if (!isValidField(field_name)) throw new Error("Invalid field name");

    const model = modelMap[modelName];

    if (!model) throw new Error("Invalid model name");

    if (!mongoose.Types.ObjectId.isValid(idString)) return null;

    const doc = await model.findById(new mongoose.Types.ObjectId(idString));
    return doc ? doc[field_name] || null : null;
  } catch (error) {
    console.error("Error in getColumnValueById →", error.message);
    throw new Error("Database query failed");
  }
};

export const getCountryNamesByIds = async (ids) => {
  if (!Array.isArray(ids) || ids.length === 0) return "";

  // Filter out invalid ObjectIds
  const validObjectIds = ids
    .filter((id) => mongoose.Types.ObjectId.isValid(id))
    .map((id) => new mongoose.Types.ObjectId(id));

  try {
    const countries = await list_tbl_countrie.find({
      _id: { $in: validObjectIds },
    });

    const countryNames = countries.map((country) => country.name);

    return countryNames.join(", ");
  } catch (error) {
    console.error("Error fetching country names:", error.message);
    throw new Error("Failed to fetch country names");
  }
};

export const getLanguageAndProficiencyMaps = async () => {
  try {
    const [languages, proficiencies] = await Promise.all([
      list_language.find({}, { _id: 1, name: 1 }),
      list_language_proficiency.find({}, { _id: 1, name: 1 }),
    ]);

    const languageMap = {};
    languages.forEach((lang) => {
      languageMap[String(lang._id)] = lang.name;
    });

    const proficiencyMap = {};
    proficiencies.forEach((prof) => {
      proficiencyMap[String(prof._id)] = prof.name;
    });

    return { languageMap, proficiencyMap };
  } catch (error) {
    console.error("Mapping fetch error:", error.message);
    throw new Error("Failed to fetch language/proficiency names");
  }
};
export const formatLanguageDetails = async (languages) => {
  const { languageMap, proficiencyMap } = await getLanguageAndProficiencyMaps();

  return languages.map((lang) => ({
    language: languageMap[String(lang.language)] || `ID ${lang.language}`,
    proficiency:
      proficiencyMap[String(lang.proficiency)] || `ID ${lang.proficiency}`,
    read: lang.read,
    write: lang.write,
    speak: lang.speak,
  }));
};

export const getMoreInfoNames = async (ids) => {
  if (!Array.isArray(ids) || ids.length === 0) return [];

  // Remove duplicates and filter invalid ObjectIds
  const uniqueValidIds = [...new Set(ids)].filter((id) =>
    mongoose.Types.ObjectId.isValid(id)
  );

  try {
    const documents = await list_more_information.find({
      _id: { $in: uniqueValidIds.map((id) => new mongoose.Types.ObjectId(id)) },
    });

    // Create a map from ObjectId -> name
    const nameMap = {};
    documents.forEach((doc) => {
      nameMap[String(doc._id)] = doc.name;
    });

    // Return names in the original order
    return ids.map((id) => nameMap[id]).filter(Boolean);
  } catch (error) {
    console.error("Error fetching more_info names:", error.message);
    return [];
  }
};

export const formatUserData = (result) => {
  const getFormattedDOB = (dob) => {
    if (!dob) return "";
    const date = new Date(dob);
    const options = { day: "2-digit", month: "short", year: "numeric" };
    // return date.toLocaleDateString("en-GB", options); // e.g., "13 Oct 2001"
    return dob;
  };

  const getMoreInfo = (moreInfoArray) => {
    return (moreInfoArray || []).filter(Boolean).join(" , ");
  };

  const getDisabilityInfo = (differentlyAbled, type, desc, assistance) => {
    if (differentlyAbled !== "Yes") return "No";
    return [differentlyAbled, type, desc, assistance]
      .filter(Boolean)
      .join(", ");
  };

  const getCareerBreakInfo = (
    status,
    reason,
    startMonth,
    startYear,
    endMonth,
    endYear,
    current
  ) => {
    return {
      careerBreak: status,
      careerBreakReason: reason || "",
      careerBreakStartMonth: startMonth || "",
      careerBreakStartYear: startYear || "",
      careerBreakEndMonth: current ? "" : endMonth || "",
      careerBreakEndYear: current ? "" : endYear || "",
      currentlyOnCareerBreak: current || false,
    };
  };

  const formatLanguages = (languages = []) =>
    languages.map((lang) => ({
      language: lang.language || "",
      proficiency: lang.proficiency || "",
      read: !!lang.read,
      write: !!lang.write,
      speak: !!lang.speak,
    }));

  // Career break formatted separately for spreading into result
  const careerBreakData = getCareerBreakInfo(
    result.career_break,
    result.career_break_reason,
    result.career_break_start_month,
    result.career_break_start_year,
    result.career_break_end_month,
    result.career_break_end_year,
    result.currently_on_career_break
  );
  // console.log(careerBreakData);

  return {
    usa_visa_type: result.usa_visa_type || "",
    gender: result.gender || "",
    maritalStatus: result.marital_status || "",
    moreinfo: getMoreInfo(result.more_info),
    dob: getFormattedDOB(result.dob),
    category: result.category || "",
    differentlyAbled: result.differently_abled || "No",
    disabilityType: result.disability_type || "",
    disabilityDescription: result.disability_description || "",
    workplaceAssistance: result.workplace_assistance || "",
    workPermit: result.work_permit_other_countries || "",
    address: `${result.hometown || ""}, ${result.permanent_address || ""}, ${
      result.pincode || ""
    }`
      .replace(/^, |, ,/g, "")
      .trim(),
    languages: formatLanguages(result.languages),
    ...careerBreakData,
  };
};
