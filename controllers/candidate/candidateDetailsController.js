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
import ResumeDetails from "../../models/resumeDetailsModels.js";
import list_non_tech_skill from "../../models/monogo_query/nonTechSkillModel.js";
import CandidateKYC from "../../models/CandidateKYCModel.js";
import Otherskill from "../../models/OtherSkillModel.js";
import mongoose from "mongoose";

const getUniqueIds = (arr, field) => [
    ...new Set(arr.map((e) => e[field]).filter(Boolean)),
];

const createMap = (arr, key = "id", value = "name") =>
    Object.fromEntries(arr.map((item) => [item[key], item[value]]));

const calculateAge = (dob) => {
    if (!dob) return ""; // handle missing DOB safely

    const birthDate = new Date(dob);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    // adjust if birthday hasn't occurred yet this year
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return `${age} Years`;
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


export const getCandidateDetails = async (req, res) => {
    try {
        // const adminId = req.userId;
        const userId = req.query.candidateId;

        if (!userId) {
            return res.status(400).json({ message: "User ID and Candidate ID both are required." });
        }

        // Fetching all core data in parallel
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
            nonItSkills,
            userProjects,
            careerProfile,
            candidateResume,
            candidateKycDetails
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
            Otherskill.find({ userId, is_del: false }).lean(),
            ProjectDetails.find({ userId, isDel: false }).lean(),
            UserCareer.find({ userId, isDel: false }).lean(),
            ResumeDetails.findOne({ user: userId, isDel: false }).select("fileUrl").lean(),
            CandidateKYC.findOne({ userId }).lean(),
        ]);

        const userDetails = userDetailsArr[0] || {};
        const candidateDetails = candidateDetailsArr[0] || {};
        const userPref = careerProfile[0] || {};

        // Collect unique IDs
        const universityIds = educationRaw?.length ? getUniqueIds(educationRaw, "universityName") : [];
        const instituteIds = educationRaw?.length ? getUniqueIds(educationRaw, "instituteName") : [];
        const courseIds = educationRaw?.length ? getUniqueIds(educationRaw, "courseName") : [];
        const boardIds = educationRaw?.length ? getUniqueIds(educationRaw, "board") : [];
        const levelIds = educationRaw?.length ? getUniqueIds(educationRaw, "level") : [];
        const courseTypeIds = educationRaw?.length ? getUniqueIds(educationRaw, "courseType") : [];
        const gradingSystemIds = educationRaw?.length ? getUniqueIds(educationRaw, "gradingSystem") : [];
        const companyIds = employmentsRaw?.length ? getUniqueIds(employmentsRaw, "companyName") : [];
        const socialProfileIds = onlineProfilesRaw?.length ? getUniqueIds(onlineProfilesRaw, "socialProfile") : [];
        const itSkillIds = userItSkills?.length ? getUniqueIds(userItSkills, "skillSearch") : [];
        const nonItSkillIds = nonItSkills?.length ? getUniqueIds(nonItSkills, "skillSearch") : [];
        const taggedWithIds = userProjects?.length ? getUniqueIds(userProjects, "taggedWith") : [];
        const languageIds = userDetails?.languageProficiency?.length ? getUniqueIds(userDetails.languageProficiency, "language") : [];
        const languageProficiencyIds = userDetails?.languageProficiency?.length ? getUniqueIds(userDetails.languageProficiency, "proficiency") : [];

        // Fetch all referenced data safely
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
            nonItSkillNameList,
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
            countryName,
        ] = await Promise.all([
            Array.isArray(universityIds) && universityIds.length > 0
                ? list_university_univercities.find({ id: { $in: universityIds } }).lean()
                : Promise.resolve([]),
            Array.isArray(instituteIds) && instituteIds.length > 0
                ? list_university_colleges.find({ id: { $in: instituteIds } }).lean()
                : Promise.resolve([]),
            Array.isArray(courseIds) && courseIds.length > 0
                ? list_university_course.find({ id: { $in: courseIds } }).lean()
                : Promise.resolve([]),
            Array.isArray(boardIds) && boardIds.length > 0
                ? list_education_boards.find({ id: { $in: boardIds } }).lean()
                : Promise.resolve([]),
            Array.isArray(levelIds) && levelIds.length > 0
                ? list_education_levels.find({ id: { $in: levelIds } }).lean()
                : Promise.resolve([]),
            Array.isArray(courseTypeIds) && courseTypeIds.length > 0
                ? list_course_type.find({ id: { $in: courseTypeIds } }).lean()
                : Promise.resolve([]),
            Array.isArray(gradingSystemIds) && gradingSystemIds.length > 0
                ? list_grading_system.find({ id: { $in: gradingSystemIds } }).lean()
                : Promise.resolve([]),
            // Employment Companies
            Array.isArray(companyIds) && companyIds.length > 0
                ? companylist.find({ _id: { $in: companyIds.filter(id => mongoose.Types.ObjectId.isValid(id)) } }).lean()
                : Promise.resolve([]),
            // Social Profiles
            Array.isArray(socialProfileIds) && socialProfileIds.length > 0
                ? list_social_profile.find({ _id: { $in: socialProfileIds.filter(id => mongoose.Types.ObjectId.isValid(id)) }, is_del: 0, }, { icon: 1 }).lean()
                : Promise.resolve([]),
            // Skills
            Array.isArray(userDetails.skills) && userDetails.skills.length > 0
                ? list_key_skill.find({ _id: { $in: userDetails.skills.filter(id => mongoose.Types.ObjectId.isValid(id)) } }).lean()
                : Promise.resolve([]),
            Array.isArray(itSkillIds) && itSkillIds.length > 0
                ? list_tech_skill.find({ _id: { $in: itSkillIds.filter(id => mongoose.Types.ObjectId.isValid(id)) } }).select("name").lean()
                : Promise.resolve([]),
            Array.isArray(nonItSkillIds) && nonItSkillIds.length > 0
                ? list_non_tech_skill.find({ _id: { $in: nonItSkillIds.filter(id => mongoose.Types.ObjectId.isValid(id)) } }).select("name").lean()
                : Promise.resolve([]),
            Array.isArray(taggedWithIds) && taggedWithIds.length > 0
                ? list_project_tag.find({ _id: { $in: taggedWithIds.filter(id => mongoose.Types.ObjectId.isValid(id)) } }).lean()
                : Promise.resolve([]),
            userPref?.CurrentIndustry ? list_industries.findOne({ id: userPref.CurrentIndustry }).select("job_industry").lean() : Promise.resolve([]),
            userPref?.CurrentDepartment ? list_department.findOne({ id: userPref.CurrentDepartment }).select("job_department").lean() : Promise.resolve([]),
            userPref?.JobRole ? list_job_role.findById(userPref.JobRole).select("job_role").lean() : Promise.resolve([]),
            userPref?.location ? list_india_cities.find({ _id: { $in: userPref.location } }).select("city_name").lean() : Promise.resolve([]),
            languageIds?.length ? list_language.find({ _id: { $in: languageIds } }).select("name").lean() : Promise.resolve([]),
            Array.isArray(languageProficiencyIds) && languageProficiencyIds.length > 0
                ? list_language_proficiency.find({ _id: { $in: languageProficiencyIds.filter(id => mongoose.Types.ObjectId.isValid(id)) } }).select("name").lean()
                : Promise.resolve([]),
            Array.isArray(userDetails.workPermitOther) && userDetails.workPermitOther.length > 0
                ? list_tbl_countrie
                    .find({
                        id: {
                            $in: userDetails.workPermitOther
                                .map(Number)
                                .filter(v => !isNaN(v)),
                        },
                    })
                    .select("id name")
                    .lean()
                : Promise.resolve([]),
        userDetails.category && mongoose.Types.ObjectId.isValid(userDetails.category)
            ? list_category.find({ _id: userDetails.category }).select("category_name").lean()
            : Promise.resolve([]),
            userDetails.disability_type && mongoose.Types.ObjectId.isValid(userDetails.disability_type)
                ? list_disability_type.find({ _id: userDetails.disability_type }).select("name").lean()
                : Promise.resolve([]),
            userDetails.reason && mongoose.Types.ObjectId.isValid(userDetails.reason)
                ? list_career_break_reason.find({ _id: userDetails.reason }).select("name").lean()
                : Promise.resolve([]),
            userDetails.maritialStatus && mongoose.Types.ObjectId.isValid(userDetails.maritialStatus)
                ? list_marital_status.findById(userDetails.maritialStatus).select("status").lean()
                : Promise.resolve([]),
            userDetails.usaPermit && mongoose.Types.ObjectId.isValid(userDetails.usaPermit)
                ? list_visa_type.findById(userDetails.usaPermit).select("visa_name").lean()
                : Promise.resolve([]),
            Array.isArray(userDetails.additionalInformation) && userDetails.additionalInformation.length > 0
                ? list_more_information.find({
                    _id: {
                        $in: userDetails.additionalInformation.filter(id =>
                            mongoose.Types.ObjectId.isValid(id)
                        )
                    }
                }).select("name").lean()
                : Promise.resolve([]),
            user?.gender ? list_gender.findById(user.gender).select("name").lean() : Promise.resolve([]),

            candidateDetails?.country_id
                ? list_tbl_countrie.findOne(
                    { id: Number(candidateDetails.country_id) }, // change to _id if needed
                    { name: 1 }
                ).lean()
                : Promise.resolve(null),
        ]);

// Create Maps for lookup
const universityMap = createMap(universities);
const instituteMap = createMap(institutes);
const courseMap = createMap(courses);
const boardMap = createMap(boards, "id", "board_name");
const levelMap = createMap(levels, "id", "level");
const gradingSystemMap = createMap(gradingSystemName, "id", "name");
const courseTypeMap = createMap(courseTypes);
const companyMap = createMap(companies, "_id", "companyname");
const socialIconMap = createMap(socialProfiles, "_id", "icon");
const itSkillMap = createMap(itSkillNameList, "_id", "name");
const nonItSkillMap = createMap(nonItSkillNameList, "_id", "name");
const taggedWithMap = createMap(taggedWithNames, "_id", "name");
const languageNameWithMap = createMap(languageName, "_id", "name");
const languageProficiencyWithMap = createMap(proficiencyName, "_id", "name");
const workPermitOtherNameWithMap = createMap(workPermitOtherName, "id", "name");
const addiInfoNameWithMap = createMap(addiInfoName, "_id", "name");

// Education Section
const education = (educationRaw || [])
    .map((edu) => {
        const isSchool = ["1", "2"].includes(edu.level);

        return {
            _id: edu._id || "",
            level: edu.level || "",
            type: isSchool ? "school" : "higher",
            levelName: levelMap[edu.level] || "Unknown Level",
            marks: edu.marks || "Not Provided",

            ...(isSchool
                ? {
                    board: boardMap[edu.board] || "Unknown Board",
                    year_of_passing: edu.year_of_passing || "Not Provided",
                }
                : {
                    courseName: courseMap[edu.courseName] || "Unknown Course",
                    instituteName: instituteMap[edu.instituteName] || "Unknown Institute",
                    universityName: universityMap[edu.universityName] || "Unknown University",
                    courseType: courseTypeMap[edu.courseType] || "Unknown Course Type",
                    gradingName: gradingSystemMap[edu.gradingSystem] || "Not Provided",
                    from: edu.duration?.from || "Not Provided",
                    to: edu.duration?.to || "Not Provided",
                }),
        };
    })
    .sort((a, b) => Number(b.level) - Number(a.level)); // Descending order

// Mapping IT skills
const itSkillNames = [
    ...new Set( // remove duplicates
        (userItSkills || [])
            .map(data => itSkillMap[data.skillSearch?.toString()]?.trim().toLowerCase())
            .filter(Boolean)
    )
];

// Mapping Non IT skills
const nonItSkillNames = [
    ...new Set( // remove duplicates
        (nonItSkills || [])
            .map(data => nonItSkillMap[data.skillSearch?.toString()]?.trim().toLowerCase())
            .filter(Boolean)
    )
];

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

const candidateProjects = await Promise.all(
    userProjects.map(async (project) => {
        const taggedWith = project.taggedWith || "";
        const tag = taggedWithNames.find(
            t => t._id.toString() === taggedWith.toString()
        );

        const taggedName = tag ? tag.name : null;

        return {
            _id: project._id,
            userId: project.userId,
            title: project.projectTitle || "",
            taggedWith,
            taggedName,
            client: project.clientName || "",
            status: project.projectStatus || "",
            description: project.description || "",
            workfromyear: project.workedFrom?.year || null,
            workfrommonth: project.workedFrom?.month || null,
            workfrommonth_name: project.workedFrom?.month
                ? monthNames[project.workedFrom.month - 1]
                : null,
            worktoyear: project.workedTill?.year || null,
            worktomonth: project.workedTill?.month || null,
            worktomonth_name: project.workedTill?.month
                ? monthNames[project.workedTill.month - 1]
                : null,
            createdAt: project.createdAt || null,
            updatedAt: project.updatedAt || null,
        };
    })
);

// Extract current employment safely
let currentEmployment = "Fresher";

// Check if employments exists and is a non-empty array
if (Array.isArray(employmentsRaw) && employmentsRaw.length > 0) {
    // Find current employment where currentEmployment = true
    currentEmployment =
        employmentsRaw.find(emp => emp.currentEmployment === true) ||
        employmentsRaw.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
}

const userInformation = {
    _id: user?._id || "",
    fullName: user?.name || "",
    fatherName: candidateDetails?.fatherName || "",
    email: user?.email || "",
    phoneNumber: user?.phone_number || "",
    profilePicture: user?.profilePicture || "",
    createdAt: user?.createdAt || "",
    currentLocation: candidateDetails?.currentLocation || "",
    countryName: countryName?.name || "",
    hometown: candidateDetails?.hometown || "",
    currentJobTitle: currentEmployment?.jobTitle || "",
    resumeHeadline: userDetails?.resumeHeadline || "",
    profileSummary: userDetails?.profileSummary || "",
    expectedSalary: userPref?.expectedSalary || {},
    skills: Array.isArray(skills)
        ? skills
            .filter(skill => skill?.Skill && skill.is_active === 1 && skill.is_del === 0)
            .map(skill => skill.Skill)
        : [],
};

const formattedEmployment = (employmentsRaw || []).map((emp) => {
    const joiningYear = emp.joiningDate?.year;
    const leavingYear = emp.leavingDate?.year;

    let duration = "Not Provided";

    if (joiningYear && leavingYear) {
        duration = `${joiningYear} - ${leavingYear}`;
    } else if (joiningYear && !leavingYear) {
        duration = `${joiningYear} - Present`;
    }

    const companyName = companyMap[emp.companyName?.toString()] || "Unknown Company";

    return {
        _id: emp._id || "",
        jobTitle: emp.jobTitle || "Not Provided",
        companyName: companyName,
        jobDescription: emp.jobDescription || "Not Provided",
        joiningYear: joiningYear || "",
        leavingYear: leavingYear || "",
        duration,
        isVerified: emp.isVerified || false,
        meta: companyName?.charAt(0).toUpperCase() || "",
    };
})
    .sort((a, b) => {
        // If "Present" job (no leavingYear), it should come first
        if (!a.leavingYear && b.leavingYear) return -1;
        if (a.leavingYear && !b.leavingYear) return 1;

        // Otherwise, sort by leavingYear descending
        const leaveA = a.leavingYear || 0;
        const leaveB = b.leavingYear || 0;

        if (leaveA !== leaveB) return leaveB - leaveA;

        // If same leaving year, sort by joiningYear descending
        return (b.joiningYear || 0) - (a.joiningYear || 0);
    });


// Define your proficiency priority
const proficiencyOrder = {
    Expert: 1,
    Proficient: 2,
    Beginner: 3,
};

// SidebarDetails
const sidebarDetails = {
    totalExperience: candidateDetails?.totalExperience || "",
    age: calculateAge(candidateDetails?.dob),
    currentSalary:
        candidateDetails?.currentSalary && candidateDetails?.currentSalary?.salary != null
            ? candidateDetails.currentSalary
            : { currency: "", salary: 0 },
    expectedSalary: userPref?.expectedSalary || {},
    genderName: userGender?.name || "",
    languages: (userDetails?.languageProficiency || [])
        .map(lp => {
            const lang = languageName.find(l => l._id.toString() === lp.language.toString());
            const prof = proficiencyName.find(p => p._id.toString() === lp.proficiency.toString());
            return { lang: lang?.name, prof: prof?.name };
        })
        .sort((a, b) => (proficiencyOrder[a.prof] || 99) - (proficiencyOrder[b.prof] || 99))
        .map(i => i.lang),
    highestEducation:
        Array.isArray(education) && education.length > 0
            ? education.reduce((highest, current) =>
                Number(current.level) > Number(highest.level) ? current : highest
            ).levelName
            : "",
    resumeUrl: candidateResume?.fileUrl || "",
};

// Map Online Profiles
const mappedOnlineProfiles = onlineProfilesRaw.map(profile => ({
    _id: profile._id,
    url: profile.url,
    icon: socialIconMap[profile.socialProfile] || null
}));


// KYC Details
// Define the document types you want to check
const docTypes = ["pan", "epic", "aadhar", "passport", "dl"];
const kycResult = {};

// Iterate over each type and determine verified or not
for (const type of docTypes) {
    const verifiedField = `${type}_verified`;
    const value = candidateKycDetails?.[verifiedField];

    const isVerified = value === true ? true : false;

    // Add verified status to result like { pan_verified: true }
    kycResult[verifiedField] = isVerified;
}

const candidatePersonalDetails = {
    category: categoryName?.[0]?.category_name || "",
    career_break: userDetails?.careerBreak ?? "",
    currently_on_career_break: userDetails.currentlyOnCareerBreak ?? false,
    career_break_start_month: getMonthName(userDetails.startMonth),
    career_break_start_year: userDetails.startYear,
    career_break_end_month: getMonthName(userDetails.endMonth),
    career_break_end_year: userDetails.endYear,
    career_break_reason: breakReasonName?.[0]?.name || "",
    differently_abled: userDetails?.differentlyAble ?? "",
    disability_type: disabilityTypeName?.[0]?.name || "",
    disability_description: userDetails.other_disability_type,
    workplace_assistance: userDetails.workplace_assistance,
    usa_visa_type: usaPermitName?.visa_name || "",
    work_permit_other_countries: (userDetails?.workPermitOther || [])
        .map((id) => workPermitOtherNameWithMap[id] || "")
        .filter(Boolean)
        .join(", "),
    permanent_address: userDetails.permanentAddress,
    pincode: userDetails.pincode,
    marital_status: maritalStatusName?.status || "",
    more_info: (userDetails?.additionalInformation || [])
        .map((id) => addiInfoNameWithMap[id] || "")
        .filter(Boolean)
        .join(", "),
};

const candidateCareerProfile = {
    industry_name: currentIndustry?.job_industry || "",
    department_name: currentDepartment?.job_department || "",
    job_role_name: jobRole?.job_role || "",
    job_type: userPref?.DesiredJob || "",
    employment_type: userPref?.DesiredEmployment || "",
    shift: userPref?.PreferredShift || "",
    expected_salary: userPref?.expectedSalary?.salary
        ? new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: userPref?.expectedSalary?.currency || "INR",
            maximumFractionDigits: 0
        }).format(userPref.expectedSalary.salary)
        : "",
    preferredLocations: (locations || []).map((c) => c.city_name).join(", "),
};

// Return Final Data 
return res.status(200).json({
    success: true,
    message: "Candidate details fetched successfully!",
    data: {
        userInformation,
        education,
        employment: formattedEmployment,
        sidebarDetails,
        onlineProfiles: mappedOnlineProfiles,
        itSkillNames,
        nonItSkillNames,
        kycResult,
        candidateProjects,
        userCertifications,
        userPatents,
        userPresentations,
        researchPublications,
        workSamples,
        candidatePersonalDetails,
        candidateCareerProfile,
    },
});
    } catch (error) {
    console.error("Error fetching candidate details:", error);
    return res.status(500).json({
        success: false,
        message: "Error fetching candidate details",
        error: error.message,
    });
}
};