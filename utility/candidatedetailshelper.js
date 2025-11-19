import { GetProgress } from "./helper/getprogress.js";
import candidateDetails from "../models/CandidateDetailsModel.js";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import usereducation from "../models/userEducationModel.js";
import list_gender from "../models/monogo_query/genderModel.js";
import list_education_level from "../models/monogo_query/educationLevelModel.js";
import personalDetails from "../models/personalDetails.js";
import list_key_skill from "../models/monogo_query/keySkillModel.js";
import list_tbl_countrie from "../models/monogo_query/countriesModel.js";
import CandidateKYC from "../models/CandidateKYCModel.js";
import OnlineProfile from "../models/OnlineProfile.js";
import mongoose from "mongoose";

//model for educations
//import list_education_level from "../models/monogo_query/educationLevelModel.js";
import list_university_state from "../models/monogo_query/universityStateModel.js";
import list_university_univercities from "../models/monogo_query/universityUniversityModel.js";
import list_university_colleges from "../models/monogo_query/universityCollegesModel.js";
import list_university_course from "../models/monogo_query/universityCourseModel.js";
import list_course_type from "../models/monogo_query/courseTypeModel.js";
import list_grading_system from "../models/monogo_query/gradingSystemModel.js";
import list_medium_of_education from "../models/monogo_query/mediumOfEducationModel.js";
import list_education_boards from "../models/monogo_query/educationBoardModel.js";
import list_school_list from "../models/monogo_query/schoolListModel.js";
//import list_gender from "../models/monogo_query/genderModel.js";
import list_category from "../models/monogo_query/categoryModel.js";
import list_disability_type from "../models/monogo_query/disabilityType.js";
import list_visa_type from "../models/monogo_query/visaTypeModel.js";
//import list_tbl_countrie from "../models/monogo_query/countriesModel.js";
import list_marital_status from "../models/monogo_query/maritalStatusModel.js";
import list_more_information from "../models/monogo_query/moreInformationModel.js";
import list_language from "../models/monogo_query/languageModel.js";
import list_language_proficiency from "../models/monogo_query/languageProficiencyModel.js";
import list_career_break_reason from "../models/monogo_query/careerBreakReasonModel.js";
import {
  getColumnValueById,
  getCountryNamesByIds,
  formatLanguageDetails,
  getMoreInfoNames,
  formatUserData,
} from "./helper/mongogiveIDgetname.js";

import WorkSample from "../models/WorkSample.js";
import UserResearch from "../models/ResearchModel.js";
import UserPresentation from "../models/PrensentationModel.js";
import UserPatent from "../models/PatentModel.js";
import UserCertification from "../models/CertificationModel.js";

import list_industries from "../models/monogo_query/industryModel.js";
import list_department from "../models/monogo_query/departmentsModel.js";
import list_job_role from "../models/monogo_query/jobRolesModel.js";
import list_india_cities from "../models/monogo_query/indiaCitiesModel.js";
import UserCareer from "../models/CareerModel.js";

import Employment from "../models/Employment.js";
import companylist from "../models/CompanyListModel.js";
import list_notice from "../models/monogo_query/noticeModel.js";

import ProjectDetails from "../models/projectModel.js";
import list_project_tag from "../models/monogo_query/project_tagModel.js";

export const getProjectDetails = async (candidateId) => {
  try {
    if (!candidateId) {
      return [];
    }

    const projectDetails = await ProjectDetails.find({
      userId: candidateId,
      isDel: false,
    })
      .sort({ createdAt: -1 })
      .lean();

    if (!projectDetails.length) {
      return [];
    }

    // Extract all tag IDs from projects
    const tagIds = [
      ...new Set(
        projectDetails
          .map((p) => p.taggedWith?.toString())
          .filter((id) => mongoose.Types.ObjectId.isValid(id))
      ),
    ];

    // Fetch all tags in one query
    const tags = await list_project_tag
      .find({ _id: { $in: tagIds } })
      .select("_id name")
      .lean();

    // Create tag map for O(1) lookup
    const tagMap = Object.fromEntries(
      tags.map((t) => [t._id.toString(), t.name])
    );

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

    const getMonthName = (month) => (month ? monthNames[month - 1] : null);

    // Final formatting
    const formatted = projectDetails.map((doc) => ({
      _id: doc._id,
      userId: doc.userId,
      title: doc.projectTitle || "",
      taggedWith: doc.taggedWith || "",
      taggedWithName: doc.taggedWith ? tagMap[doc.taggedWith] || null : null,
      client: doc.clientName || "",
      status: doc.projectStatus || "",
      description: doc.description || "",
      workfromyear: doc.workedFrom?.year || null,
      workfrommonth: doc.workedFrom?.month || null,
      workfrommonth_name: getMonthName(doc.workedFrom?.month),
      worktoyear: doc.workedTill?.year || null,
      worktomonth: doc.workedTill?.month || null,
      worktomonth_name: getMonthName(doc.workedTill?.month),
      createdAt: doc.createdAt || null,
      updatedAt: doc.updatedAt || null,
    }));

    return formatted;
  } catch (error) {
    console.error("Project Details error →", error);
    return [];
  }
};

export const getEmploymentDetails = async (candidateId) => {
  try {
    if (!candidateId) return [];

    // Fetch employment data
    const employmentData = await Employment.find({
      user: candidateId,
      isDel: false,
    })
      .sort({ "joiningDate.year": -1, "joiningDate.month": -1 })

      .lean();

    /* sort by joiningDate: {
      year: {
        type: Number,
        default: 0,
      },
      month: {
        type: Number,
        default: 0,
      }
    }, */

    if (!employmentData.length) return [];

    // Extract unique company IDs and notice period IDs
    const companyIds = new Set();
    const noticePeriodIds = new Set();

    for (const emp of employmentData) {
      if (emp.companyName) companyIds.add(emp.companyName.toString());
      if (emp.NoticePeriod) noticePeriodIds.add(emp.NoticePeriod.toString());
    }

    // Fetch related data in parallel
    const [companies, noticePeriods] = await Promise.all([
      companylist
        .find({ _id: { $in: [...companyIds] } })
        .select("_id companyname")
        .lean(),

      list_notice
        .find({ id: { $in: [...noticePeriodIds] } })
        .select("id name")
        .lean(),
    ]);

    // Map data for O(1) lookup
    const companyMap = {};
    for (const c of companies) {
      companyMap[c._id.toString()] = c.companyname;
    }

    const noticePeriodMap = {};
    for (const n of noticePeriods) {
      noticePeriodMap[n.id.toString()] = n.name;
    }

    const monthNames = [
      "",
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

    // Format data
    return employmentData.map((item) => {
      const joinMonth = item.joiningDate?.month || "";
      const leaveMonth = item.leavingDate?.month || "";

      return {
        _id: item._id,
        currentlyWorking: item.currentEmployment ?? false,
        employmenttype: item.employmentType || "",
        experience_yr: item.totalExperience?.year?.toString() || "",
        experience_month: item.totalExperience?.month?.toString() || "",
        company_name: companyMap[item.companyName] || "",
        company_id: item.companyName || "",
        job_title: item.jobTitle || "",
        joining_year: item.joiningDate?.year || "",
        joining_month: joinMonth,
        joining_month_name: monthNames[joinMonth] || "",
        leaving_year: item.leavingDate?.year || "",
        leaving_month: leaveMonth,
        leaving_month_name: monthNames[leaveMonth] || "",
        description: item.jobDescription || "",
        isVerified: item.isVerified,
        jobTypeVerified: item.jobTypeVerified,
        jobDurationVerified: item.jobDurationVerified,
        designationVerified: item.designationVerified,
        notice_period: item.NoticePeriod || "",
        remarks: item.remarks || "",
        notice_period_name: noticePeriodMap[item.NoticePeriod] || "",
      };
    });
  } catch (error) {
    console.error("Error:", error);
    return [];
  }
};

export const getCareerProfile = async (candidateId) => {
  try {
    if (!candidateId) return [];

    // Fetch career profile
    const careerProfile = await UserCareer.findOne({
      userId: candidateId,
      isDel: false,
    }).lean();

    if (!careerProfile) return [];

    const {
      CurrentIndustry,
      CurrentDepartment,
      JobRole,
      DesiredJob,
      DesiredEmployment,
      location = [],
      expectedSalary = {},
      PreferredShift,
    } = careerProfile;

    // Normalize location IDs
    const locationIds = Array.isArray(location) ? location : [];

    // Fetch all dependent lookups in parallel
    const [industryDoc, departmentDoc, jobRoleDoc, cityDocs] =
      await Promise.all([
        CurrentIndustry
          ? list_industries
              .findOne({ id: CurrentIndustry })
              .select("job_industry")
              .lean()
          : null,

        CurrentDepartment
          ? list_department
              .findOne({ id: CurrentDepartment })
              .select("job_department")
              .lean()
          : null,

        JobRole
          ? list_job_role.findById(JobRole).select("job_role").lean()
          : null,

        locationIds.length
          ? list_india_cities
              .find({ _id: { $in: locationIds } })
              .select("city_name")
              .lean()
          : [],
      ]);

    const result = {
      // industry: CurrentIndustry || "",
      industry_name: industryDoc?.job_industry || "",
      //  department: CurrentDepartment || "",
      department_name: departmentDoc?.job_department || "",
      // job_role: JobRole || "",
      job_role_name: jobRoleDoc?.job_role || "",
      job_type: DesiredJob || "",
      employment_type: DesiredEmployment || "",
      //  work_location: locationIds,
      work_location_name: (cityDocs || []).map((c) => c.city_name).join(", "),
      currency_type: expectedSalary.currency || "",
      expected_salary: expectedSalary.salary || 0,
      shift: PreferredShift || "",
    };

    return result;
  } catch (error) {
    console.error("Error fetching Career Profile:", error.message);
    return [];
  }
};

export const list_certificate = async (candidateId) => {
  try {
    const userId = candidateId;
    //   console.log(userId);
    const certificates = await UserCertification.find({ userId, isDel: false });

    return certificates;
  } catch (error) {
    return [];
  }
};

export const listpatent = async (candidateId) => {
  try {
    const userId = candidateId;
    const patents = await UserPatent.find({ userId, isDel: false });

    return patents;
  } catch (error) {
    console.error("Error in listpatent:", error.message);
    return [];
  }
};
export const getpresetation = async (candidateId) => {
  try {
    const userId = candidateId;
    const presentations = await UserPresentation.find({ userId, isDel: false });

    return presentations;
  } catch (error) {
    console.error("Error in getpresetation:", error.message);
    return [];
  }
};
export const getResearchPublication = async (candidateId) => {
  try {
    if (!candidateId) return [];

    const userResearch = await UserResearch.find({
      userId: candidateId,
      isDel: false,
    })
      .sort({ createdAt: -1 })
      .lean(); // faster + no _doc

    if (userResearch.length === 0) return [];

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

    return userResearch.map((item) => ({
      ...item,
      publishedOn: {
        year: item.publishedOn.year,
        month_id: item.publishedOn.month,
        month: monthNames[item.publishedOn.month - 1],
      },
    }));
  } catch (error) {
    console.error("Error in getResearchPublication:", error.message);
    return [];
  }
};

export const getWorkSamples = async (candidateId) => {
  const userId = candidateId;

  const workSamples = await WorkSample.find({
    userId,
    isDel: false,
  }).sort({ createdAt: -1 });

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

  const formattedSamples = workSamples.map((sample) => {
    return {
      ...sample._doc,
      durationFrom: {
        year: sample.durationFrom.year,
        month: monthNames[sample.durationFrom.month - 1],
        month_id: sample.durationFrom.month,
      },
      durationTo: {
        year: sample.durationTo.year,
        month: monthNames[sample.durationTo.month - 1],
        month_id: sample.durationTo.month,
      },
    };
  });

  return formattedSamples;
};

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

export const getKYC = async (candidateId) => {
  const kyc = await CandidateKYC.findOne({ userId: candidateId })
    .select(
      "pan_number pan_name pan_verified epic_number epic_name epic_verified passport_number passport_name passport_dob passport_verified dl_number dl_name dl_dob dl_verified aadhar_number aadhar_name aadhar_verified"
    )
    .lean();

  return {
    pan: {
      number: maskNumber(kyc?.pan_number),
      name: kyc?.pan_name || "N/A",
      verified: kyc?.pan_verified || false,
    },
    epic: {
      number: maskNumber(kyc?.epic_number),
      name: kyc?.epic_name || "N/A",
      verified: kyc?.epic_verified || false,
    },
    passport: {
      number: maskNumber(kyc?.passport_number),
      name: kyc?.passport_name || "N/A",
      dob: formatIndianDate(kyc?.passport_dob),
      verified: kyc?.passport_verified || false,
    },
    dl: {
      number: maskNumber(kyc?.dl_number),
      name: kyc?.dl_name || "N/A",
      dob: formatIndianDate(kyc?.dl_dob),
      verified: kyc?.dl_verified || false,
    },
    aadhar: {
      number: maskNumber(kyc?.aadhar_number),
      name: kyc?.aadhar_name || "N/A",
      verified: kyc?.aadhar_verified || false,
    },
  };
};

export const headsection = async ({ user_id, user }) => {
  if (!user_id || !user) return {};

  // ------------------------------
  // 1. Format phone (fastest way)
  // ------------------------------
  let isIndianNumber = false;
  if (user.phone_number) {
    const pn = parsePhoneNumberFromString(user.phone_number);
    if (pn?.isValid()) {
      user.phone_number = `+${pn.countryCallingCode} ${pn.nationalNumber}`;
      isIndianNumber = pn.country === "IN";
    }
  }

  // ------------------------------
  // 2. Parallel DB batch
  // ------------------------------
  const [progress, personalData, educations, genderDoc] = await Promise.all([
    GetProgress(user_id),

    candidateDetails
      .findOne(
        { userId: user_id },
        "dob country_id currentLocation hometown fatherName motherName currentSalary totalExperience"
      )
      .lean(),

    usereducation
      .find({ userId: user_id, isDel: false }, "level isPrimary")
      .lean(),

    user.gender
      ? list_gender
          .findOne({
            _id: user.gender,
            is_del: 0,
            is_active: 1,
          })
          .lean()
      : null,
  ]);

  // ------------------------------
  // 3. Resolve gender
  // ------------------------------
  const gender_name = genderDoc?.name || "";

  // ------------------------------
  // 4. Resolve Education Level
  // ------------------------------
  let degree = "";

  if (educations?.length) {
    const primary = educations.find((e) => e.isPrimary);
    const selectedLevel = primary
      ? parseInt(primary.level)
      : Math.max(
          ...educations.map((e) => parseInt(e.level)).filter((n) => !isNaN(n))
        );

    if (selectedLevel) {
      const levelDoc = await list_education_level
        .findOne({
          id: selectedLevel,
          is_del: 0,
          is_active: 1,
        })
        .lean();

      degree = levelDoc?.level || "";
    }
  }

  // ------------------------------
  // 5. Build response
  // ------------------------------
  return {
    ...user,
    ...(personalData && {
      dob: formatIndianDate(personalData.dob),
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
    gender_name,
    degree,
    progress: progress || 0,
    isIndianNumber,
  };
};

export const getPersonalDetails = async (user_id, user) => {
  let data = {};
  try {
    const [details, candidate] = await Promise.all([
      personalDetails.findOne({ user: user_id }).lean(),
      candidateDetails
        .findOne({ userId: user_id })
        .select("dob hometown")
        .lean(),
    ]);

    if (details) {
      const personal = details;
      const uniqueSkillIds = [
        ...new Set(details.skills.map((id) => id.toString())),
      ].map((id) => new mongoose.Types.ObjectId(id));
      if (uniqueSkillIds.length > 0) {
        const skills = await list_key_skill
          .find(
            { _id: { $in: uniqueSkillIds }, is_del: 0, is_active: 1 },
            { Skill: 1, _id: 0 }
          )
          .lean();
        const skillNames = skills.map((skill) => skill.Skill);
        data.skills = skillNames;
      } else {
        data.skills = [];
      }
      data.resumeHeadline = details.resumeHeadline || "";
      data.profileSummary = details.profileSummary || "";
      data.stringdob = candidate.dob ? formatIndianDate(candidate.dob) : "";
      if (candidate) {
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
          getColumnValueById(
            "list_category",
            details.category,
            "category_name"
          ),
          getColumnValueById(
            "list_disability_type",
            personal.disability_type,
            "name"
          ),
          getColumnValueById("list_visa_type", personal.usaPermit, "visa_name"),
          // getCountryNamesByIds(personal.workPermitOther),
          personal.workPermitOther && personal.workPermitOther.length > 0
            ? (
                await list_tbl_countrie.find({
                  id: { $in: personal.workPermitOther },
                })
              )
                .map((c) => c.name)
                .join(", ")
            : "",
          getColumnValueById(
            "list_marital_status",
            personal.maritialStatus,
            "status"
          ),
          getMoreInfoNames(personal.additionalInformation || []),
          formatLanguageDetails(personal.languageProficiency || []),
          getColumnValueById(
            "list_career_break_reason",
            personal.reason,
            "name"
          ),
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

        data = { ...data, ...formatUserData(result) };
      }
    } else {
      data.resumeHeadline = "";
      data.profileSummary = "";
      data.skills = [];
    }
  } catch (error) {
    console.log(error);
  }
  return data;
};

export const getuseraccademicdetails = async (user_id) => {
  try {
    const educationRecords = await usereducation
      .find({ userId: user_id, isDel: false })
      .sort({ level: -1 })
      .lean();

    if (!educationRecords?.length) return [];

    // ------------------------------------
    // 1. Collect lookup IDs efficiently
    // ------------------------------------
    const lookupSets = {
      level: new Set(),
      state: new Set(),
      universityName: new Set(),
      instituteName: new Set(),
      courseName: new Set(),
      courseType: new Set(),
      gradingSystem: new Set(),
      medium_of_education: new Set(),
      board: new Set(),
      school_name: new Set(),
    };

    for (let i = 0; i < educationRecords.length; i++) {
      const rec = educationRecords[i];
      for (const key in lookupSets) {
        const val = rec[key];
        if (val) lookupSets[key].add(val);
      }
    }

    // Convert Sets → Arrays (faster than Object.entries map)
    const lookupIds = {};
    for (const key in lookupSets) {
      lookupIds[key] = [...lookupSets[key]];
    }

    // ------------------------------------
    // 2. Lookup config (static reference)
    // ------------------------------------
    const lookupConfig = {
      level: {
        model: list_education_level,
        field: "level",
        proj: { id: 1, level: 1, _id: 0 },
      },
      state: { model: list_university_state, field: "name" },
      universityName: { model: list_university_univercities, field: "name" },
      instituteName: { model: list_university_colleges, field: "name" },
      courseName: { model: list_university_course, field: "name" },
      courseType: { model: list_course_type, field: "name" },
      gradingSystem: { model: list_grading_system, field: "name" },
      medium_of_education: {
        model: list_medium_of_education,
        field: "name",
      },
      /*    board: { model: list_education_boards, field: "board_name" }, */
      board: {
        model: list_education_boards,
        field: "board_name",
        proj: { id: 1, board_name: 1, _id: 0 },
      },

      school_name: { model: list_school_list, field: "school_name" },
    };

    // ------------------------------------
    // 3. Run all DB lookups in parallel
    // ------------------------------------
    const lookupPromises = [];

    for (const key in lookupConfig) {
      const ids = lookupIds[key];
      if (!ids.length) {
        lookupPromises.push(Promise.resolve([key, {}]));
        continue;
      }

      const { model, field, proj } = lookupConfig[key];

      lookupPromises.push(
        model
          .find({ id: { $in: ids } }, proj || { id: 1, name: 1, _id: 0 })
          .lean()
          .then((list) => {
            const map = {};
            for (let i = 0; i < list.length; i++) {
              const item = list[i];
              map[item.id] = item[field];
            }
            return [key, map];
          })
      );
    }

    const mapsArr = await Promise.all(lookupPromises);

    // Convert to object (faster than Object.fromEntries)
    const maps = {};
    for (let i = 0; i < mapsArr.length; i++) {
      const [key, val] = mapsArr[i];
      maps[key] = val;
    }

    // ------------------------------------
    // 4. Final mapping (optimized loop, no spread)
    // ------------------------------------
    const finalData = new Array(educationRecords.length);

    for (let i = 0; i < educationRecords.length; i++) {
      const rec = educationRecords[i];

      finalData[i] = {
        ...rec,
        level_id: rec.level,
        level: maps.level[rec.level] || rec.level,
        state: maps.state[rec.state] || rec.state,
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
    }

    return finalData;
  } catch (error) {
    console.error(error);
    return [];
  }
};

// Convert any date to DD/MM/YYYY in Indian timezone
export const formatIndianDate = (date) => {
  if (!date) return "N/A";

  const d = new Date(date);
  if (isNaN(d)) return "N/A";

  return d.toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// Mask any number/string: **** **** 1234
export const maskNumber = (value) => {
  if (!value) return "";

  const s = value.toString().replace(/\s+/g, ""); // remove spaces
  if (s.length <= 4) return s; // nothing to mask

  return "*".repeat(s.length - 4) + s.slice(-4);
};
