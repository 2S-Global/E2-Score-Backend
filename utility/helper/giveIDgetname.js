import db_sql from "../../config/sqldb.js";

const isValidName = (str) => /^[a-zA-Z0-9_]+$/.test(str);

export const getColumnValueById = async (table, id, column) => {
  try {
    // Validate table and column names
    if (!isValidName(table) || !isValidName(column)) {
      throw new Error("Invalid table or column name.");
    }

    // Safely construct query using validated names
    const query = `SELECT \`${column}\` FROM \`${table}\` WHERE id = ? LIMIT 1`;

    const [rows] = await db_sql.execute(query, [id]);

    return rows.length > 0 ? rows[0][column] : null;
  } catch (error) {
    console.error("Error fetching column value:", error.message);
    throw new Error("Database query failed");
  }
};

export const getCountryNamesByIds = async (ids) => {
  if (!Array.isArray(ids) || ids.length === 0) return "";

  const placeholders = ids.map(() => "?").join(", ");
  const query = `SELECT name FROM tbl_countries WHERE id IN (${placeholders})`;

  try {
    const [rows] = await db_sql.execute(query, ids);
    const countryNames = rows.map((row) => row.name);
    return countryNames.join(", ");
  } catch (error) {
    console.error("Error fetching country names:", error.message);
    throw new Error("Failed to fetch country names");
  }
};

export const getLanguageAndProficiencyMaps = async () => {
  try {
    const [langRows] = await db_sql.execute("SELECT id, name FROM languages");
    const [profRows] = await db_sql.execute(
      "SELECT id, name FROM language_proficiency"
    );

    const languageMap = {};
    langRows.forEach((lang) => (languageMap[lang.id] = lang.name));

    const proficiencyMap = {};
    profRows.forEach((prof) => (proficiencyMap[prof.id] = prof.name));

    return { languageMap, proficiencyMap };
  } catch (error) {
    console.error("Mapping fetch error:", error.message);
    throw new Error("Failed to fetch language/proficiency names");
  }
};
export const formatLanguageDetails = async (languages) => {
  const { languageMap, proficiencyMap } = await getLanguageAndProficiencyMaps();

  return languages.map((lang) => ({
    language: languageMap[lang.language] || `ID ${lang.language}`,
    proficiency: proficiencyMap[lang.proficiency] || `ID ${lang.proficiency}`,
    read: lang.read,
    write: lang.write,
    speak: lang.speak,
  }));
};

export const getMoreInfoNames = async (ids) => {
  if (!Array.isArray(ids) || ids.length === 0) return [];

  // Remove duplicates
  const uniqueIds = [...new Set(ids.map((id) => Number(id)))];

  const placeholders = uniqueIds.map(() => "?").join(", ");
  const query = `SELECT id, name FROM more_information WHERE id IN (${placeholders})`;

  try {
    const [rows] = await db_sql.execute(query, uniqueIds);
    const nameMap = {};
    rows.forEach((row) => (nameMap[row.id] = row.name));

    return ids.map((id) => nameMap[Number(id)]).filter(Boolean); // preserve original order
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
    return date.toLocaleDateString("en-GB", options); // e.g., "13 Oct 2001"
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
    if (status !== "Yes") return "No";

    return {
      careerBreak: "Yes",
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

  return {
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
