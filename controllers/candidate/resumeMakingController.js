import User from "../../models/userModel.js";
import usereducation from "../../models/userEducationModel.js";
import Employment from "../../models/Employment.js";
import personalDetails from "../../models/personalDetails.js";
import CandidateDetails from "../../models/CandidateDetailsModel.js";
import companylist from "../../models/CompanyListModel.js";
import OnlineProfile from "../../models/OnlineProfile.js";
import list_university_univercities from "../../models/monogo_query/universityUniversityModel.js";
import list_university_colleges from "../../models/monogo_query/universityCollegesModel.js";
import list_university_course from "../../models/monogo_query/universityCourseModel.js";
import list_education_boards from "../../models/monogo_query/educationBoardModel.js";
import list_education_levels from "../../models/monogo_query/educationLevelModel.js";
import list_course_type from "../../models/monogo_query/courseTypeModel.js";
import list_key_skill from "../../models/monogo_query/keySkillModel.js";
import list_social_profile from "../../models/monogo_query/socialProfileModel.js";
import WorkSample from "../../models/WorkSample.js";
import UserResearch from "../../models/ResearchModel.js";
import UserPresentation from "../../models/PrensentationModel.js";
import UserPatent from "../../models/PatentModel.js";
import UserCertification from "../../models/CertificationModel.js";
import Itskill from "../../models/itskillModel.js";
import list_tech_skill from "../../models/monogo_query/techSkillModel.js";
import ProjectDetails from "../../models/projectModel.js";
import list_project_tag from "../../models/monogo_query/project_tagModel.js";
import generateResumePDF from "../../services/pdfGenerator.js";
import UserCareer from "../../models/CareerModel.js";
import list_industries from "../../models/monogo_query/industryModel.js";
import list_department from "../../models/monogo_query/departmentsModel.js";
import list_job_role from "../../models/monogo_query/jobRolesModel.js";
import list_india_cities from "../../models/monogo_query/indiaCitiesModel.js";
import list_language from "../../models/monogo_query/languageModel.js";
import list_language_proficiency from "../../models/monogo_query/languageProficiencyModel.js";
import list_tbl_countrie from "../../models/monogo_query/countriesModel.js";
import list_category from "../../models/monogo_query/categoryModel.js";
import list_disability_type from "../../models/monogo_query/disabilityType.js";
import list_career_break_reason from "../../models/monogo_query/careerBreakReasonModel.js";
import list_marital_status from "../../models/monogo_query/maritalStatusModel.js";
import list_visa_type from "../../models/monogo_query/visaTypeModel.js";
import list_more_information from "../../models/monogo_query/moreInformationModel.js";
import list_gender from "../../models/monogo_query/genderModel.js";
import list_grading_system from "../../models/monogo_query/gradingSystemModel.js";

const getUniqueIds = (arr, field) => [
  ...new Set(arr.map((e) => e[field]).filter(Boolean)),
];

const createMap = (arr, key = "id", value = "name") =>
  Object.fromEntries(arr.map((item) => [item[key], item[value]]));

export const getResume = async (req, res) => {
  try {
    const userId = req.userId;

    const [
      user,
      educationRaw,
      onlineProfilesRaw,
      employmentsRaw,
      userDetailsArr,
      candidateDetailsArr,
      workSamples,
      researchPublications,
      userPresentations,
      userPatents,
      userCertifications,
      userItSkills,
      userProjects,
      careerProfile,
    ] = await Promise.all([
      User.findById(userId).lean(),
      usereducation.find({ userId, isDel: false }).lean(),
      OnlineProfile.find({ userId, isDel: false }).lean(),
      Employment.find({ user: userId, isDel: false }).lean(),
      personalDetails.find({ user: userId, isDel: false }).lean(),
      CandidateDetails.find({ userId, isDel: false }).lean(),
      WorkSample.find({ userId, isDel: false }).lean(),
      UserResearch.find({ userId, isDel: false }).lean(),
      UserPresentation.find({ userId, isDel: false }).lean(),
      UserPatent.find({ userId, isDel: false }).lean(),
      UserCertification.find({ userId, isDel: false }).lean(),
      Itskill.find({ userId, is_del: false }).lean(),
      ProjectDetails.find({ userId, isDel: false }).lean(),
      UserCareer.find({ userId, isDel: false }).lean(),
    ]);

    console.log("Project Details:", userProjects);

    const userDetails = userDetailsArr[0] || {};
    const candidateDetails = candidateDetailsArr[0] || {};

    const universityIds = getUniqueIds(educationRaw, "universityName");
    const instituteIds = getUniqueIds(educationRaw, "instituteName");
    const courseIds = getUniqueIds(educationRaw, "courseName");
    const boardIds = getUniqueIds(educationRaw, "board");
    const levelIds = getUniqueIds(educationRaw, "level");
    const courseTypeIds = getUniqueIds(educationRaw, "courseType");
    const gradingSystemIds = getUniqueIds(educationRaw, "gradingSystem");
    // For Employments
    const companyIds = getUniqueIds(employmentsRaw, "companyName");
    // For Online Profiles
    const socialProfileIds = getUniqueIds(onlineProfilesRaw, "socialProfile");
    // For IT Skills
    const itSkillIds = getUniqueIds(userItSkills, "skillSearch");
    // For Project Details
    const taggedWithIds = getUniqueIds(userProjects, "taggedWith");
    // For Language
    const languageIds = getUniqueIds(
      userDetails.languageProficiency,
      "language"
    );
    // For Language proficiency
    const languageProficiencyIds = getUniqueIds(
      userDetails.languageProficiency,
      "proficiency"
    );

    const userPref = careerProfile[0];

    const [
      universities,
      institutes,
      courses,
      boards,
      levels,
      courseTypes,
      gradingSystemName,
      companies,
      socialProfiles,
      skills,
      itSkillNameList,
      taggedWithNames,
      currentIndustry,
      currentDepartment,
      jobRole,
      locations,
      languageName,
      proficiencyName,
      workPermitOtherName,
      categoryName,
      disabilityTypeName,
      breakReasonName,
      maritalStatusName,
      usaPermitName,
      addiInfoName,
      userGender,
    ] = await Promise.all([
      list_university_univercities.find({ id: { $in: universityIds } }).lean(),
      list_university_colleges.find({ id: { $in: instituteIds } }).lean(),
      list_university_course.find({ id: { $in: courseIds } }).lean(),
      list_education_boards.find({ id: { $in: boardIds } }).lean(),
      list_education_levels.find({ id: { $in: levelIds } }).lean(),
      list_course_type.find({ id: { $in: courseTypeIds } }).lean(),
      list_grading_system.find({ id: { $in: gradingSystemIds } }).lean(),
      //For Employments
      companylist.find({ _id: { $in: companyIds } }).lean(),
      // For Online Profiles
      list_social_profile
        .find({ _id: { $in: socialProfileIds }, is_del: 0 })
        .lean(),
      // skill name value from personal details
      list_key_skill.find({ _id: { $in: userDetails.skills || [] } }).lean(),
      // Getting IT Skill Name
      list_tech_skill
        .find({ _id: { $in: itSkillIds } })
        .select("name")
        .lean(),
      // Getting taggedwithName  from user projects
      list_project_tag.find({ _id: { $in: taggedWithIds } }).lean(),
      //Getting Current Industry
      list_industries
        .findOne({ id: userPref.CurrentIndustry })
        .select("job_industry")
        .lean(),
      // Getting Current Department
      list_department
        .findOne({ id: userPref.CurrentDepartment })
        .select("job_department")
        .lean(),
      //Getting Job Role
      list_job_role.findById(userPref.JobRole).select("job_role").lean(),
      // Getting Locations
      list_india_cities
        .find({ _id: { $in: userPref.location } })
        .select("city_name")
        .lean(),
      // Getting Language Name
      list_language
        .find({ _id: { $in: languageIds } })
        .select("name")
        .lean(),
      //Getting Language Proficiency
      list_language_proficiency
        .find({ _id: { $in: languageProficiencyIds } })
        .select("name")
        .lean(),
      // Getting work permit other name
      list_tbl_countrie
        .find({ _id: { $in: userDetails.workPermitOther } })
        .select("name")
        .lean(),
      // Getting Category Name
      list_category
        .find({ _id: userDetails.category })
        .select("category_name")
        .lean(),
      // Get Disability Type Name
      list_disability_type
        .find({ _id: userDetails.disability_type })
        .select("name")
        .lean(),
      // Get Career break reason
      list_career_break_reason
        .find({ _id: userDetails.reason })
        .select("name")
        .lean(),
      // Get Marital Status Name
      list_marital_status
        .findById(userDetails.maritialStatus)
        .select("status")
        .lean(),
      // Get visa type name or usa Permit name
      // list_visa_type.findById(userDetails.usaPermit).select("visa_name").lean(),
      userDetails.usaPermit &&
      mongoose.Types.ObjectId.isValid(userDetails.usaPermit)
        ? list_visa_type
            .findById(userDetails.usaPermit)
            .select("visa_name")
            .lean()
        : Promise.resolve(null),
      // Get all Additional Information Name
      list_more_information
        .find({ _id: { $in: userDetails.additionalInformation } })
        .select("name")
        .lean(),
      // Get Gender name from id
      list_gender.findById(user.gender).select("name").lean(),
    ]);

    user.gender_name = userGender.name;

    const locationNames = locations.map((city) => city.city_name).join(", ");

    const universityMap = createMap(universities);
    const instituteMap = createMap(institutes);
    const courseMap = createMap(courses);
    const boardMap = createMap(boards, 'id', 'board_name');
    // console.log("Here is my all boards: ", boardMap); return;
    const levelMap = createMap(levels, 'id', 'level');
    const gradingSystemMap = createMap(gradingSystemName, 'id', 'name');

    const courseTypeMap = createMap(courseTypes);
    // For Employment
    const companyMap = createMap(companies, "_id", "companyname");
    // For Online Profiles
    const socialMap = createMap(socialProfiles, "_id", "name");
    // For IT skills Name
    const itSkillMap = createMap(itSkillNameList, "_id", "name");
    // For Tagged with name
    const taggedWithMap = createMap(taggedWithNames, "_id", "name");
    // For Language
    const languageNameWithMap = createMap(languageName, "_id", "name");
    // For Language Proficiency
    const languageProficiencyWithMap = createMap(
      proficiencyName,
      "_id",
      "name"
    );
    // For Work Perrmit Other Country Name
    const workPermitOtherNameWithMap = createMap(
      workPermitOtherName,
      "_id",
      "name"
    );
    // For Additional Information
    const addiInfoNameWithMap = createMap(addiInfoName, "_id", "name");

    // Modify Education result
    const education = educationRaw.map((edu) => {
      const level = edu.level;
      if (level === "1" || level === "2") {
        return {
          type: "school",
          levelId: level,
          levelName: levelMap[edu.level] || "Unknown Level",
          board: boardMap[edu.board] || "Unknown Board",
          year_of_passing: edu.year_of_passing,
          marks: edu.marks || "Not Provided",
        };
      } else {
        return {
          type: "higher",
          levelId: level,
          levelName: levelMap[edu.level] || "Unknown Level",
          courseName: courseMap[edu.courseName] || "Unknown Degree",
          instituteName: instituteMap[edu.instituteName] || "Unknown Institute",
          universityName:
            universityMap[edu.universityName] || "Unknown University",
          from: edu.duration?.from,
          to: edu.duration?.to,
          courseType: courseTypeMap[edu.courseType] || "Unknown Course Type",
          marks: edu.marks || "Not Provided",
          gradingId: edu.gradingSystem || "Not Provided",
          gradingName: gradingSystemMap[edu.gradingSystem] || "Not Provided",
        };
      }
    }).sort((a, b) => Number(b.levelId) - Number(a.levelId)); // 👈 this line sorts descending;

    // Modify Employments result
    const employment = employmentsRaw.map((job) => ({
      ...job,
      companyName:
        companyMap[job.companyName.toString()] || "Company Name Not Found",
    }));

    // Modify Online Profile Result
    const onlineProfiles = onlineProfilesRaw.map((p) => ({
      name: socialMap[p.socialProfile] || "Unknown",
      url: p.url,
    }));

    // Modify user Details Result
    userDetails.skillsResolved = skills.map((s) => s.Skill);

    // Modify IT Skill Result
    const itSkills = userItSkills.map((data) => ({
      ...data,
      skillName: itSkillMap[data.skillSearch.toString()] || "Not Found",
    }));

    // Modify Project Details For getting tagged with map
    const projectDetails = userProjects.map((data) => ({
      ...data,
      taggedWithName: taggedWithMap[data.taggedWith.toString()] || "Not Found",
    }));

    //Modify Candidate Profile Details
    const preferenceDetails = careerProfile.map((data) => ({
      ...data,
      industryName: currentIndustry?.job_industry || "Unknown Industry",
      departmentName: currentDepartment?.job_department || "Unknown Department",
      jobRoleName: jobRole?.job_role || "Unknown Role",
      preferredLocations: locationNames,
    }));

    // Modify user Personal Details
    const userPersonalDetails = {
      ...userDetails,
      languageProficiency: userDetails.languageProficiency.map((lp) => ({
        ...lp,
        languageName: languageNameWithMap[lp.language] || "",
        proficiencyName: languageProficiencyWithMap[lp.proficiency] || "",
      })),
      workPermitOtherNames: (userDetails.workPermitOther || []).map(
        (id) => workPermitOtherNameWithMap[id] || ""
      ),
      categoryName: categoryName?.[0]?.category_name || "",
      disabilityTypeName: disabilityTypeName?.[0]?.name || "",
      reasonName: breakReasonName?.[0]?.name || "",
      maritalStatusName: maritalStatusName?.status || "",
      usaPermitName: usaPermitName?.visa_name || "",
      additionalInformationNames: (userDetails.additionalInformation || []).map(
        (id) => addiInfoNameWithMap[id] || ""
      ),
    };

    console.log("Here is my Personal Details:", userPersonalDetails);

    const pdfBuffer = await generateResumePDF({
      user,
      education,
      employment,
      userDetails,
      candidateDetails,
      onlineProfiles,
      workSamples,
      researchPublications,
      userPresentations,
      userPatents,
      userCertifications,
      itSkills,
      projectDetails,
      preferenceDetails,
      userPersonalDetails,
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${user.name}_Resume.pdf"`
    );
    res.end(pdfBuffer);
  } catch (error) {
    console.error("Error fetching itskills:", error);
    res
      .status(500)
      .json({ message: "Error fetching itskills", error: error.message });
  }
};

export const AdmingetResume = async (req, res) => {
  try {
    // const userId = req.userId;

    const userId = req.params.userId;

    const [
      user,
      educationRaw,
      onlineProfilesRaw,
      employmentsRaw,
      userDetailsArr,
      candidateDetailsArr,
      workSamples,
      researchPublications,
      userPresentations,
      userPatents,
      userCertifications,
      userItSkills,
      userProjects,
      careerProfile,
    ] = await Promise.all([
      User.findById(userId).lean(),
      usereducation.find({ userId, isDel: false }).lean(),
      OnlineProfile.find({ userId, isDel: false }).lean(),
      Employment.find({ user: userId, isDel: false }).lean(),
      personalDetails.find({ user: userId, isDel: false }).lean(),
      CandidateDetails.find({ userId, isDel: false }).lean(),
      WorkSample.find({ userId, isDel: false }).lean(),
      UserResearch.find({ userId, isDel: false }).lean(),
      UserPresentation.find({ userId, isDel: false }).lean(),
      UserPatent.find({ userId, isDel: false }).lean(),
      UserCertification.find({ userId, isDel: false }).lean(),
      Itskill.find({ userId, is_del: false }).lean(),
      ProjectDetails.find({ userId, isDel: false }).lean(),
      UserCareer.find({ userId, isDel: false }).lean(),
    ]);

    console.log("Project Details:", userProjects);

    const userDetails = userDetailsArr[0] || {};
    const candidateDetails = candidateDetailsArr[0] || {};

    const universityIds = getUniqueIds(educationRaw, "universityName");
    const instituteIds = getUniqueIds(educationRaw, "instituteName");
    const courseIds = getUniqueIds(educationRaw, "courseName");
    const boardIds = getUniqueIds(educationRaw, "board");
    const levelIds = getUniqueIds(educationRaw, "level");
    const courseTypeIds = getUniqueIds(educationRaw, "courseType");
    const gradingSystemIds = getUniqueIds(educationRaw, "gradingSystem");
    // For Employments
    const companyIds = getUniqueIds(employmentsRaw, "companyName");
    // For Online Profiles
    const socialProfileIds = getUniqueIds(onlineProfilesRaw, "socialProfile");
    // For IT Skills
    const itSkillIds = getUniqueIds(userItSkills, "skillSearch");
    // For Project Details
    const taggedWithIds = getUniqueIds(userProjects, "taggedWith");
    // For Language
    const languageIds = getUniqueIds(
      userDetails.languageProficiency,
      "language"
    );
    // For Language proficiency
    const languageProficiencyIds = getUniqueIds(
      userDetails.languageProficiency,
      "proficiency"
    );

    const userPref = careerProfile[0];

    const [
      universities,
      institutes,
      courses,
      boards,
      levels,
      courseTypes,
      gradingSystemName,
      companies,
      socialProfiles,
      skills,
      itSkillNameList,
      taggedWithNames,
      currentIndustry,
      currentDepartment,
      jobRole,
      locations,
      languageName,
      proficiencyName,
      workPermitOtherName,
      categoryName,
      disabilityTypeName,
      breakReasonName,
      maritalStatusName,
      usaPermitName,
      addiInfoName,
      userGender,
    ] = await Promise.all([
      list_university_univercities.find({ id: { $in: universityIds } }).lean(),
      list_university_colleges.find({ id: { $in: instituteIds } }).lean(),
      list_university_course.find({ id: { $in: courseIds } }).lean(),
      list_education_boards.find({ id: { $in: boardIds } }).lean(),
      list_education_levels.find({ id: { $in: levelIds } }).lean(),
      list_course_type.find({ id: { $in: courseTypeIds } }).lean(),
      list_grading_system.find({ id: { $in: gradingSystemIds } }).lean(),
      //For Employments
      companylist.find({ _id: { $in: companyIds } }).lean(),
      // For Online Profiles
      list_social_profile
        .find({ _id: { $in: socialProfileIds }, is_del: 0 })
        .lean(),
      // skill name value from personal details
      list_key_skill.find({ _id: { $in: userDetails.skills || [] } }).lean(),
      // Getting IT Skill Name
      list_tech_skill
        .find({ _id: { $in: itSkillIds } })
        .select("name")
        .lean(),
      // Getting taggedwithName  from user projects
      list_project_tag.find({ _id: { $in: taggedWithIds } }).lean(),
      //Getting Current Industry
      list_industries
        .findOne({ id: userPref.CurrentIndustry })
        .select("job_industry")
        .lean(),
      // Getting Current Department
      list_department
        .findOne({ id: userPref.CurrentDepartment })
        .select("job_department")
        .lean(),
      //Getting Job Role
      list_job_role.findById(userPref.JobRole).select("job_role").lean(),
      // Getting Locations
      list_india_cities
        .find({ _id: { $in: userPref.location } })
        .select("city_name")
        .lean(),
      // Getting Language Name
      list_language
        .find({ _id: { $in: languageIds } })
        .select("name")
        .lean(),
      //Getting Language Proficiency
      list_language_proficiency
        .find({ _id: { $in: languageProficiencyIds } })
        .select("name")
        .lean(),
      // Getting work permit other name
      list_tbl_countrie
        .find({ _id: { $in: userDetails.workPermitOther } })
        .select("name")
        .lean(),
      // Getting Category Name
      list_category
        .find({ _id: userDetails.category })
        .select("category_name")
        .lean(),
      // Get Disability Type Name
      list_disability_type
        .find({ _id: userDetails.disability_type })
        .select("name")
        .lean(),
      // Get Career break reason
      list_career_break_reason
        .find({ _id: userDetails.reason })
        .select("name")
        .lean(),
      // Get Marital Status Name
      list_marital_status
        .findById(userDetails.maritialStatus)
        .select("status")
        .lean(),
      // Get visa type name or usa Permit name
      // list_visa_type.findById(userDetails.usaPermit).select("visa_name").lean(),
      userDetails.usaPermit &&
      mongoose.Types.ObjectId.isValid(userDetails.usaPermit)
        ? list_visa_type
            .findById(userDetails.usaPermit)
            .select("visa_name")
            .lean()
        : Promise.resolve(null),
      // Get all Additional Information Name
      list_more_information
        .find({ _id: { $in: userDetails.additionalInformation } })
        .select("name")
        .lean(),
      // Get Gender name from id
      list_gender.findById(user.gender).select("name").lean(),
    ]);

    user.gender_name = userGender.name;

    const locationNames = locations.map((city) => city.city_name).join(", ");

    const universityMap = createMap(universities);
    const instituteMap = createMap(institutes);
    const courseMap = createMap(courses);
    const boardMap = createMap(boards, "id", "board_name");
    const levelMap = createMap(levels, "id", "level");
    const gradingSystemMap = createMap(gradingSystemName, "id", "name");

    const courseTypeMap = createMap(courseTypes);
    // For Employment
    const companyMap = createMap(companies, "_id", "companyname");
    // For Online Profiles
    const socialMap = createMap(socialProfiles, "_id", "name");
    // For IT skills Name
    const itSkillMap = createMap(itSkillNameList, "_id", "name");
    // For Tagged with name
    const taggedWithMap = createMap(taggedWithNames, "_id", "name");
    // For Language
    const languageNameWithMap = createMap(languageName, "_id", "name");
    // For Language Proficiency
    const languageProficiencyWithMap = createMap(
      proficiencyName,
      "_id",
      "name"
    );
    // For Work Perrmit Other Country Name
    const workPermitOtherNameWithMap = createMap(
      workPermitOtherName,
      "_id",
      "name"
    );
    // For Additional Information
    const addiInfoNameWithMap = createMap(addiInfoName, "_id", "name");

    // Modify Education result
    const education = educationRaw.map((edu) => {
      const level = edu.level;
      if (level === "1" || level === "2") {
        return {
          type: "school",
          levelId: level,
          levelName: levelMap[edu.level] || "Unknown Level",
          board: boardMap[edu.board] || "Unknown Board",
          year_of_passing: edu.year_of_passing,
          marks: edu.marks || "Not Provided",
        };
      } else {
        return {
          type: "higher",
          levelId: level,
          levelName: levelMap[edu.level] || "Unknown Level",
          courseName: courseMap[edu.courseName] || "Unknown Degree",
          instituteName: instituteMap[edu.instituteName] || "Unknown Institute",
          universityName:
            universityMap[edu.universityName] || "Unknown University",
          from: edu.duration?.from,
          to: edu.duration?.to,
          courseType: courseTypeMap[edu.courseType] || "Unknown Course Type",
          marks: edu.marks || "Not Provided",
          gradingId: edu.gradingSystem || "Not Provided",
          gradingName: gradingSystemMap[edu.gradingSystem] || "Not Provided",
        };
      }
    });

    console.log("Education Data:", education);

    // Modify Employments result
    const employment = employmentsRaw.map((job) => ({
      ...job,
      companyName:
        companyMap[job.companyName.toString()] || "Company Name Not Found",
    }));

    // Modify Online Profile Result
    const onlineProfiles = onlineProfilesRaw.map((p) => ({
      name: socialMap[p.socialProfile] || "Unknown",
      url: p.url,
    }));

    // Modify user Details Result
    userDetails.skillsResolved = skills.map((s) => s.Skill);

    // Modify IT Skill Result
    const itSkills = userItSkills.map((data) => ({
      ...data,
      skillName: itSkillMap[data.skillSearch.toString()] || "Not Found",
    }));

    // Modify Project Details For getting tagged with map
    const projectDetails = userProjects.map((data) => ({
      ...data,
      taggedWithName: taggedWithMap[data.taggedWith.toString()] || "Not Found",
    }));

    //Modify Candidate Profile Details
    const preferenceDetails = careerProfile.map((data) => ({
      ...data,
      industryName: currentIndustry?.job_industry || "Unknown Industry",
      departmentName: currentDepartment?.job_department || "Unknown Department",
      jobRoleName: jobRole?.job_role || "Unknown Role",
      preferredLocations: locationNames,
    }));

    // Modify user Personal Details
    const userPersonalDetails = {
      ...userDetails,
      languageProficiency: userDetails.languageProficiency.map((lp) => ({
        ...lp,
        languageName: languageNameWithMap[lp.language] || "",
        proficiencyName: languageProficiencyWithMap[lp.proficiency] || "",
      })),
      workPermitOtherNames: (userDetails.workPermitOther || []).map(
        (id) => workPermitOtherNameWithMap[id] || ""
      ),
      categoryName: categoryName?.[0]?.category_name || "",
      disabilityTypeName: disabilityTypeName?.[0]?.name || "",
      reasonName: breakReasonName?.[0]?.name || "",
      maritalStatusName: maritalStatusName?.status || "",
      usaPermitName: usaPermitName?.visa_name || "",
      additionalInformationNames: (userDetails.additionalInformation || []).map(
        (id) => addiInfoNameWithMap[id] || ""
      ),
    };

    console.log("Here is my Personal Details:", userPersonalDetails);

    const pdfBuffer = await generateResumePDF({
      user,
      education,
      employment,
      userDetails,
      candidateDetails,
      onlineProfiles,
      workSamples,
      researchPublications,
      userPresentations,
      userPatents,
      userCertifications,
      itSkills,
      projectDetails,
      preferenceDetails,
      userPersonalDetails,
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${user.name}_Resume.pdf"`
    );
    res.end(pdfBuffer);
  } catch (error) {
    console.error("Error fetching itskills:", error);
    res
      .status(500)
      .json({ message: "Error fetching itskills", error: error.message });
  }
};
