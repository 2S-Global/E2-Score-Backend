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
import mongoose from "mongoose";

const getUniqueIds = (arr, field) => [
    ...new Set(arr.map((e) => e[field]).filter(Boolean)),
];

const createMap = (arr, key = "id", value = "name") =>
    Object.fromEntries(arr.map((item) => [item[key], item[value]]));

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

        const userDetails = userDetailsArr[0] || {};
        const candidateDetails = candidateDetailsArr[0] || {};
        const userPref = careerProfile[0] || {};

        // ===== Collect unique IDs =====
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
        const taggedWithIds = userProjects?.length ? getUniqueIds(userProjects, "taggedWith") : [];
        const languageIds = userDetails?.languageProficiency?.length ? getUniqueIds(userDetails.languageProficiency, "language") : [];
        const languageProficiencyIds = userDetails?.languageProficiency?.length ? getUniqueIds(userDetails.languageProficiency, "proficiency") : [];

        // ===== Fetch all referenced data safely =====
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
                ? list_social_profile.find({ _id: { $in: socialProfileIds.filter(id => mongoose.Types.ObjectId.isValid(id)) }, is_del: 0 }).lean()
                : Promise.resolve([]),
            // Skills
            Array.isArray(userDetails.skills) && userDetails.skills.length > 0
                ? list_key_skill.find({ _id: { $in: userDetails.skills.filter(id => mongoose.Types.ObjectId.isValid(id)) } }).lean()
                : Promise.resolve([]),
            Array.isArray(itSkillIds) && itSkillIds.length > 0
                ? list_tech_skill.find({ _id: { $in: itSkillIds.filter(id => mongoose.Types.ObjectId.isValid(id)) } }).select("name").lean()
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
                ? list_tbl_countrie.find({ _id: { $in: userDetails.workPermitOther.filter(id => mongoose.Types.ObjectId.isValid(id)) } }).select("name").lean()
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
            userDetails.additionalInformation && mongoose.Types.ObjectId.isValid(userDetails.additionalInformation)
                ? list_more_information.find({ _id: { $in: userDetails.additionalInformation } }).select("name").lean()
                : Promise.resolve([]),
            user?.gender ? list_gender.findById(user.gender).select("name").lean() : Promise.resolve([]),
        ]);

        // ===== Create Maps for lookup =====
        const universityMap = createMap(universities);
        const instituteMap = createMap(institutes);
        const courseMap = createMap(courses);
        const boardMap = createMap(boards, "id", "board_name");
        console.log("Here is my board map: ", boardMap);
        const levelMap = createMap(levels, "id", "level");
        const gradingSystemMap = createMap(gradingSystemName, "id", "name");
        const courseTypeMap = createMap(courseTypes);
        const companyMap = createMap(companies, "_id", "companyname");
        const socialMap = createMap(socialProfiles, "_id", "name");
        const itSkillMap = createMap(itSkillNameList, "_id", "name");
        const taggedWithMap = createMap(taggedWithNames, "_id", "name");
        const languageNameWithMap = createMap(languageName, "_id", "name");
        const languageProficiencyWithMap = createMap(proficiencyName, "_id", "name");
        const workPermitOtherNameWithMap = createMap(workPermitOtherName, "_id", "name");
        const addiInfoNameWithMap = createMap(addiInfoName, "_id", "name");

        // ===== Format Results =====
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

        const employment = (employmentsRaw || []).map((job) => ({
            ...job,
            companyName: companyMap[job.companyName?.toString()] || "Unknown Company",
        }));

        const itSkills = (userItSkills || []).map((data) => ({
            ...data,
            skillName: itSkillMap[data.skillSearch?.toString()] || "Not Found",
        }));

        const projectDetails = (userProjects || []).map((data) => ({
            ...data,
            taggedWithName: taggedWithMap[data.taggedWith?.toString()] || "Not Found",
        }));

        const preferenceDetails = (careerProfile || []).map((data) => ({
            ...data,
            industryName: currentIndustry?.job_industry || "Unknown Industry",
            departmentName: currentDepartment?.job_department || "Unknown Department",
            jobRoleName: jobRole?.job_role || "Unknown Role",
            preferredLocations: (locations || []).map((c) => c.city_name).join(", "),
        }));

        const userPersonalDetails = {
            ...(userDetails || {}),
            genderName: userGender?.name || "",
            categoryName: categoryName?.[0]?.category_name || "",
            disabilityTypeName: disabilityTypeName?.[0]?.name || "",
            reasonName: breakReasonName?.[0]?.name || "",
            maritalStatusName: maritalStatusName?.status || "",
            usaPermitName: usaPermitName?.visa_name || "",
            languageProficiency: (userDetails?.languageProficiency || []).map((lp) => ({
                ...lp,
                languageName: languageNameWithMap[lp.language] || "",
                proficiencyName: languageProficiencyWithMap[lp.proficiency] || "",
            })),
            workPermitOtherNames: (userDetails?.workPermitOther || []).map(
                (id) => workPermitOtherNameWithMap[id] || ""
            ),
            additionalInformationNames: (userDetails?.additionalInformation || []).map(
                (id) => addiInfoNameWithMap[id] || ""
            ),
        };


        // Extract current employment safely
        let currentEmployment = "Fresher";

        // Check if employments exists and is a non-empty array
        if (Array.isArray(employment) && employment.length > 0) {
            // Find current employment where currentEmployment = true
            currentEmployment =
                employment.find(emp => emp.currentEmployment === true) ||
                employment.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
        }

        const userInformation = {
            // Basic Info
            _id: user?._id || "",
            fullName: user?.name || "",
            email: user?.email || "",
            profilePicture: user?.profilePicture || "",
            createdAt: user?.createdAt || "",
            currentLocation: candidateDetails?.currentLocation || "",
            currentJobTitle: currentEmployment?.jobTitle || "",
            resumeHeadline: userPersonalDetails?.resumeHeadline || "",
            profileSummary: userPersonalDetails?.profileSummary || "",
            expectedSalary: preferenceDetails[0]?.expectedSalary || {},
            skills: Array.isArray(skills)
                ? skills
                    .filter(skill => skill?.Skill && skill.is_active === 1 && skill.is_del === 0)
                    .map(skill => skill.Skill)
                : [],
            // mobile: userDetails?.mobile || "",
            // dob: userDetails?.dob || "",
            // address: userDetails?.address || "",
            // city: userDetails?.city || "",
            // state: userDetails?.state || "",
            // pincode: userDetails?.pincode || "",

            // // Derived / lookup fields
            // genderName: userGender?.name || "",
            // categoryName: categoryName?.[0]?.category_name || "",
            // disabilityTypeName: disabilityTypeName?.[0]?.name || "",
            // reasonName: breakReasonName?.[0]?.name || "",
            // maritalStatusName: maritalStatusName?.status || "",
            // usaPermitName: usaPermitName?.visa_name || "",

            // // Arrays (processed mappings)
            // languageProficiency: (userDetails?.languageProficiency || []).map(lp => ({
            //     languageName: languageNameWithMap[lp.language] || "",
            //     proficiencyName: languageProficiencyWithMap[lp.proficiency] || "",
            // })),

            // workPermitOtherNames: (userDetails?.workPermitOther || []).map(
            //     id => workPermitOtherNameWithMap[id] || ""
            // ),

            // additionalInformationNames: (userDetails?.additionalInformation || []).map(
            //     id => addiInfoNameWithMap[id] || ""
            // ),
        };

        // ===== Return Final Data =====
        return res.status(200).json({
            success: true,
            message: "Candidate details fetched successfully!",
            data: {
                userInformation,
                education,
                user,
                userPersonalDetails,
                candidateDetails,
                employment,
                itSkills,
                onlineProfiles: onlineProfilesRaw,
                projects: projectDetails,
                workSamples,
                researchPublications,
                userPresentations,
                userPatents,
                userCertifications,
                preferenceDetails,
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
