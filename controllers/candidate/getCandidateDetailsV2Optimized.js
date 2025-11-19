// controllers/getCandidateDetailsV2Optimized.js
import mongoose from "mongoose";
import User from "../../models/userModel.js";
import personalDetails from "../../models/personalDetails.js";
import candidateDetails from "../../models/CandidateDetailsModel.js";
import usereducation from "../../models/userEducationModel.js";
import CandidateKYC from "../../models/CandidateKYCModel.js";

// lookup models
import list_gender from "../../models/monogo_query/genderModel.js";
import list_education_level from "../../models/monogo_query/educationLevelModel.js";
import list_key_skill from "../../models/monogo_query/keySkillModel.js";
import list_tbl_countrie from "../../models/monogo_query/countriesModel.js";
import list_category from "../../models/monogo_query/categoryModel.js";
import list_disability_type from "../../models/monogo_query/disabilityType.js";
import list_visa_type from "../../models/monogo_query/visaTypeModel.js";
import list_marital_status from "../../models/monogo_query/maritalStatusModel.js";
import list_career_break_reason from "../../models/monogo_query/careerBreakReasonModel.js";
import list_more_information from "../../models/monogo_query/moreInformationModel.js";
import list_language from "../../models/monogo_query/languageModel.js";
import list_language_proficiency from "../../models/monogo_query/languageProficiencyModel.js";
import list_education_boards from "../../models/monogo_query/educationBoardModel.js";
import list_university_univercities from "../../models/monogo_query/universityUniversityModel.js";
import list_university_colleges from "../../models/monogo_query/universityCollegesModel.js";
import list_university_course from "../../models/monogo_query/universityCourseModel.js";
import list_course_type from "../../models/monogo_query/courseTypeModel.js";
import list_grading_system from "../../models/monogo_query/gradingSystemModel.js";
import list_medium_of_education from "../../models/monogo_query/mediumOfEducationModel.js";
import list_school_list from "../../models/monogo_query/schoolListModel.js";

// optional: if you have GetProgress helper
import { GetProgress } from "../../utility/helper/getprogress.js";
// reuse utility functions you already have (or copy equivalents)
import {
  formatIndianDate,
  maskNumber,
} from "../../utility/candidatedetailshelper.js";
import { formatUserData } from "../../utility/helper/mongogiveIDgetname.js";
// small helper for month name (or reuse existing)
const getMonthName = (m) => {
  const monthIndex = parseInt(m, 10) - 1;
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

const createMapById = (list, idKey = "id", valueKey = "name") => {
  const map = {};
  if (!Array.isArray(list)) return map;
  for (let i = 0; i < list.length; i++) {
    const it = list[i];
    if (it && it[idKey] !== undefined)
      map[it[idKey]] =
        valueKey === "_self" ? it : it[valueKey] ?? it.name ?? it[idKey];
  }
  return map;
};

export const getCandidateDetailsV2Optimized = async (req, res) => {
  const candidateId = req.query.candidateId;
  if (!candidateId)
    return res.status(400).json({ message: "Candidate ID is required." });

  try {
    // ---------------------------
    // 1. top-level parallel DB fetch
    // ---------------------------
    const t0 = performance.now();
    const [
      user,
      personalDoc,
      candidateDoc,
      educationRecords,
      kycDoc,
      // lookup collections (fetch small reference tables wholly — they are small)
      genderList,
      educationLevels,
      keySkills,
      countries,
      categories,
      disabilityTypes,
      visaTypes,
      maritalStatuses,
      careerBreakReasons,
      moreInformation,
      languagesList,
      languageProfs,
      educationBoards,
      univercities,
      colleges,
      courses,
      courseTypes,
      gradingSystems,
      mediums,
      schoolList,
      progressValuePromise, // include progress call as promise placeholder
    ] = await Promise.all([
      // core documents
      User.findById(candidateId)
        .select(
          "name profilePicture email phone_number address gender role createdAt updatedAt isVerified numberVerified"
        )
        .lean(),
      personalDetails.findOne({ user: candidateId }).lean(),
      candidateDetails.findOne({ userId: candidateId }).lean(),
      usereducation
        .find({ userId: candidateId, isDel: false })
        .sort({ level: -1 })
        .lean(),
      CandidateKYC.findOne({ userId: candidateId }).lean(),
      // lookups (fetch all active or all entries; these collections are small lookup tables)
      list_gender.find({}).lean(),
      list_education_level.find({ is_del: 0, is_active: 1 }).lean(),
      list_key_skill.find({ is_del: 0, is_active: 1 }).lean(),
      list_tbl_countrie.find({}).lean(),
      list_category.find({}).lean(),
      list_disability_type.find({}).lean(),
      list_visa_type.find({}).lean(),
      list_marital_status.find({}).lean(),
      list_career_break_reason.find({}).lean(),
      list_more_information.find({}).lean(),
      list_language.find({}).lean(),
      list_language_proficiency.find({}).lean(),
      list_education_boards.find({}).lean(),
      list_university_univercities.find({}).lean(),
      list_university_colleges.find({}).lean(),
      list_university_course.find({}).lean(),
      list_course_type.find({}).lean(),
      list_grading_system.find({}).lean(),
      list_medium_of_education.find({}).lean(),
      list_school_list.find({}).lean(),
      // progress (call GetProgress if available; else Promise.resolve(0))
      typeof GetProgress === "function"
        ? GetProgress(candidateId)
        : Promise.resolve(0),
    ]);
    const t1 = performance.now();
    // console.log("Top-level DB fetch took:", (t1 - t0).toFixed(2), "ms");

    // quick validation
    if (!user || user.role !== 1) {
      return res.status(404).json({ message: "Candidate not found." });
    }

    // ---------------------------
    // 2. build lookup maps (in-memory)
    // ---------------------------
    const genderMap = createMapById(genderList, "_id", "name");
    const eduLevelMap = createMapById(educationLevels, "id", "level");
    const keySkillMap = createMapById(keySkills, "_id", "Skill"); // id -> Skill
    const countryMap = createMapById(countries, "id", "name");
    const categoryMap = createMapById(categories, "_id", "category_name");
    const disabilityMap = createMapById(disabilityTypes, "_id", "name");
    const visaMap = createMapById(visaTypes, "_id", "visa_name");
    const maritalMap = createMapById(maritalStatuses, "_id", "status");
    const careerBreakMap = createMapById(careerBreakReasons, "_id", "name");
    const moreInfoMap = createMapById(moreInformation, "_id", "name");
    const languageMap = createMapById(languagesList, "_id", "name");
    const languageProfMap = createMapById(languageProfs, "_id", "name");
    const boardMap = createMapById(educationBoards, "id", "board_name");
    const univercityMap = createMapById(univercities, "id", "name");
    const collegeMap = createMapById(colleges, "id", "name");
    const courseMap = createMapById(courses, "id", "name");
    const courseTypeMap = createMapById(courseTypes, "id", "name");
    const gradingMap = createMapById(gradingSystems, "id", "name");
    const mediumMap = createMapById(mediums, "id", "name");
    const schoolMap = createMapById(schoolList, "id", "school_name");

    // ---------------------------
    // 3. Build headsectiondata (no DB calls here)
    // ---------------------------
    const isIndianNumber = (() => {
      if (!user.phone_number) return false;
      try {
        // lightweight formatting; keep parsePhoneNumber only if needed (optional)
        // if parsePhoneNumberFromString is available and imported, use it; here we keep the string as-is
        return (
          user.phone_number.includes("+91") ||
          user.phone_number.startsWith("91")
        );
      } catch (e) {
        return false;
      }
    })();

    const personalData = personalDoc || null;

    const headsectiondata = {
      ...user,
      ...(personalData && {
        dob: personalData.dob ? formatIndianDate(personalData.dob) : undefined,
        country_id: personalData.country_id,
        currentLocation: personalData.currentLocation,
        hometown: personalData.hometown,
        father_name: personalData.fatherName || "",
        mother_name: personalData.motherName || "",
        currency: personalData.currentSalary?.currency || "",
        salary: personalData.currentSalary?.salary || 0,
        experience_years: personalData.totalExperience?.year || "",
        experience_months: personalData.totalExperience?.month || "",
      }),
      gender_name: genderMap[user.gender] || "",
      degree: (() => {
        // determine selected level from educations (primary or max)
        if (!Array.isArray(educationRecords) || educationRecords.length === 0)
          return "";
        const primary = educationRecords.find((e) => e.isPrimary);
        const selectedLevel = primary
          ? parseInt(primary.level)
          : Math.max(
              ...educationRecords
                .map((e) => parseInt(e.level))
                .filter((n) => !isNaN(n))
            );
        return selectedLevel ? eduLevelMap[selectedLevel] || "" : "";
      })(),
      progress: progressValuePromise || 0,
      isIndianNumber,
    };

    // ---------------------------
    // 4. Build personalData (skills, resumeHeadline, profileSummary, languages, more info etc.)
    //     - use personalDetails (personalDoc), candidateDetails
    // ---------------------------
    const pd = personalDoc || {};
    const cand = candidateDoc || {};

    // skills
    let skillsResult = [];
    if (pd.skills && pd.skills.length) {
      // pd.skills are objectIds or strings
      const uniq = Array.from(new Set(pd.skills.map((s) => s?.toString())));
      skillsResult = uniq.map((id) => keySkillMap[id] || null).filter(Boolean);
    }

    // string dob from candidateDoc
    const stringdob = cand.dob ? formatIndianDate(cand.dob) : "";

    // languages and more info
    const languages =
      Array.isArray(pd.languageProficiency) && pd.languageProficiency.length
        ? pd.languageProficiency.map((lp) => ({
            language: languageMap[lp.language] || "",
            proficiency: languageProfMap[lp.proficiency] || "",
            read: !!lp.read,
            write: !!lp.write,
            speak: !!lp.speak,
          }))
        : [];

    const moreInfo =
      Array.isArray(pd.additionalInformation) && pd.additionalInformation.length
        ? pd.additionalInformation
            .map((id) => moreInfoMap[id] || "")
            .filter(Boolean)
            .join(" , ")
        : "";

    // compute values that original getPersonalDetails returned via formatUserData
    const personalResultRaw = {
      gender: genderMap[user.gender] || "",
      dob: cand.dob || "",
      hometown: cand.hometown || "",
      category: pd.category ? categoryMap[pd.category] || "" : "",
      career_break: pd.careerBreak || "",
      currently_on_career_break: pd.currentlyOnCareerBreak || false,
      career_break_start_month: getMonthName(pd.startMonth),
      career_break_start_year: pd.startYear,
      career_break_end_month: getMonthName(pd.endMonth),
      career_break_end_year: pd.endYear,
      career_break_reason: pd.reason ? careerBreakMap[pd.reason] || "" : "",
      differently_abled: pd.differentlyAble ?? "",
      disability_type: pd.disability_type
        ? disabilityMap[pd.disability_type] || ""
        : "",
      disability_description: pd.other_disability_type,
      workplace_assistance: pd.workplace_assistance,
      usa_visa_type: pd.usaPermit ? visaMap[pd.usaPermit] || "" : "",
      work_permit_other_countries:
        Array.isArray(pd.workPermitOther) && pd.workPermitOther.length
          ? pd.workPermitOther
              .map((x) => countryMap[Number(x)] || "")
              .filter(Boolean)
              .join(", ")
          : "",
      permanent_address: pd.permanentAddress,
      pincode: pd.pincode,
      languages,
      marital_status: pd.maritialStatus
        ? maritalMap[pd.maritialStatus] || ""
        : "",
      partner_name: pd.partnerName || "",
      more_info: moreInfo,
    };

    // merge formatted fields using existing formatUserData function (keeps same shape)
    const personalDataResult = {
      resumeHeadline: pd.resumeHeadline || "",
      profileSummary: pd.profileSummary || "",
      skills: skillsResult,
      stringdob,
      ...formatUserData(personalResultRaw),
    };

    // ---------------------------
    // 5. Build academicDetails (map educationRecords to readable values)
    // ---------------------------
    const maps = {
      level: eduLevelMap,
      state: createMapById(
        list_university_state ? list_university_state : [],
        "id",
        "name"
      ), // defensive — if not imported keep empty
      universityName: univercityMap,
      instituteName: collegeMap,
      courseName: courseMap,
      courseType: courseTypeMap,
      gradingSystem: gradingMap,
      medium_of_education: mediumMap,
      board: boardMap,
      school_name: schoolMap,
    };

    const academicDetails = (educationRecords || []).map((rec) => {
      return {
        ...rec,
        level_id: rec.level,
        level: maps.level[rec.level] || rec.level,
        state: maps.state?.[rec.state] || rec.state,
        universityName:
          maps.universityName[rec.universityName] || rec.universityName,
        instituteName:
          maps.instituteName[rec.instituteName] || rec.instituteName,
        courseName: maps.courseName[rec.courseName] || rec.courseName,
        courseType: maps.courseType[rec.courseType] || rec.courseType,
        gradingSystem:
          maps.gradingSystem[rec.gradingSystem] || rec.gradingSystem,
        medium_of_education:
          maps.medium_of_education[rec.medium_of_education] ||
          rec.medium_of_education,
        board: maps.board[rec.board] || rec.board,
        school_name: maps.school_name[rec.school_name] || rec.school_name,
      };
    });

    // ---------------------------
    // 6. Build kycData (mask + format)
    // ---------------------------
    const k = kycDoc || {};
    const kycData = {
      pan: {
        number: maskNumber(k.pan_number),
        name: k.pan_name || "N/A",
        verified: !!k.pan_verified,
      },
      epic: {
        number: maskNumber(k.epic_number),
        name: k.epic_name || "N/A",
        verified: !!k.epic_verified,
      },
      passport: {
        number: maskNumber(k.passport_number),
        name: k.passport_name || "N/A",
        dob: formatIndianDate(k.passport_dob),
        verified: !!k.passport_verified,
      },
      dl: {
        number: maskNumber(k.dl_number),
        name: k.dl_name || "N/A",
        dob: formatIndianDate(k.dl_dob),
        verified: !!k.dl_verified,
      },
      aadhar: {
        number: maskNumber(k.aadhar_number),
        name: k.aadhar_name || "N/A",
        verified: !!k.aadhar_verified,
      },
    };

    // ---------------------------
    // 7. finalize and return
    // ---------------------------
    const tEnd = performance.now();
    // console.log("Optimized controller total:", (tEnd - t0).toFixed(2), "ms");

    return res.status(200).json({
      message: "Candidate details fetched successfully.",
      success: true,
      data: {
        headsectiondata,
        kycData,
        personalData: personalDataResult,
        academicDetails,
      },
      debug: { candidateId },
    });
  } catch (err) {
    console.error("Optimized controller error:", err);
    return res
      .status(500)
      .json({ message: "Internal server error.", error: err.message });
  }
};
