import db_sql from "../../config/sqldb.js";
import list_tbl_countrie from "../../models/monogo_query/countriesModel.js";
import list_gender from "../../models/monogo_query/genderModel.js";
import list_key_skill from "../../models/monogo_query/keySkillModel.js";
import list_more_information from "../../models/monogo_query/moreInformationModel.js";
import list_marital_status from "../../models/monogo_query/maritalStatusModel.js";
import list_category from "../../models/monogo_query/categoryModel.js";
import list_career_break_reason from "../../models/monogo_query/careerBreakReasonModel.js";
import list_visa_type from "../../models/monogo_query/visaTypeModel.js";

/**
 * @description Get all countries from the database
 * @route GET /api/sql/dropdown/All_contry
 * @success {object} 200 - All countries
 * @error {object} 500 - Database query failed
 */
export const All_country = async (req, res) => {
    try {
        const countries = await list_tbl_countrie.find({ is_del: 0, is_active: 1 }, { _id: 1, name: 1 });

        // Transform _id to id
        const formattedCountries = countries.map((country) => ({
            id: country._id,
            name: country.name,
        }));

        res.status(200).json({
            success: true,
            data: formattedCountries,
            message: "All country",
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Database query failed" });
    }
};

/**
 * @description Get all genders from the database
 * @route GET /api/sql/dropdown/All_gender
 * @success {object} 200 - All genders
 * @error {object} 500 - Database query failed
 */
export const All_gender = async (req, res) => {
    try {
        const gender = await list_gender.find({ is_del: 0, is_active: 1 }, { _id: 1, name: 1 });

        const formattedGender = gender.map((genders) => ({
            id: genders._id,
            name: genders.name,
        }));

        res.status(200).json({
            success: true,
            data: formattedGender,
            message: "All Gender",
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Database query failed" });
    }
};

/**
 * @description Get 50 random skills from the database
 * @route GET /api/sql/dropdown/Random_Skill
 * @success {object} 200 - Random 50 Skills
 * @error {object} 500 - Database query failed
 */
export const getSkill = async (req, res) => {
    try {
        const skillsResult = await list_key_skill.aggregate([
            { $match: { is_del: 0, is_active: 1 } },
            { $sample: { size: 50 } },
            { $project: { _id: 0, Skill: 1 } },
        ]);

        // Convert to array of strings
        const skills = skillsResult.map((item) => item.Skill);

        res.status(200).json({
            success: true,
            data: skills,
            message: "Random 50 Skills",
        });
    } catch (error) {
        console.error("MySQL error →", error);
        res.status(500).json({ success: false, message: "Database query failed" });
    }
};

/**
 * @description Search for matching skills based on the query parameter skill_name
 * @route GET /api/sql/dropdown/matching_Skill?skill_name=:skill_name
 * @param {string} skill_name - The string to search for in the skills table
 * @success {object} 200 - Matching skills
 * @error {object} 400 - skill_name query parameter is required
 * @error {object} 500 - Database query failed
 */
export const getMatchingSkillBySql = async (req, res) => {
    const { skill_name } = req.query;

    if (!skill_name || skill_name.trim() === "") {
        return res.status(400).json({
            success: false,
            message: "skill_name query parameter is required",
        });
    }

    try {
        const [rows] = await db_sql.execute(
            `SELECT Skill FROM key_skills 
       WHERE is_del = 0 AND is_active = 1 AND Skill LIKE ? 
       ORDER BY Skill LIMIT 50;`,
            [`${skill_name}%`]
        );

        const skills = rows.map((row) => row.Skill);

        res.status(200).json({
            success: true,
            data: skills,
            message: `Matching skills for "${skill_name}"`,
        });
    } catch (error) {
        console.error("MySQL error →", error);
        res.status(500).json({ success: false, message: "Database query failed" });
    }
};

export const getMatchingSkill = async (req, res) => {
    const { skill_name } = req.query;

    if (!skill_name || skill_name.trim() === "") {
        return res.status(400).json({
            success: false,
            message: "skill_name query parameter is required",
        });
    }

    try {
        const skillsResult = await list_key_skill.find(
            {
                is_del: 0,
                is_active: 1,
                Skill: { $regex: `^${skill_name}`, $options: "i" }, // case-insensitive "starts with"
            },
            "Skill" // project only Skill field
        )
            .sort({ Skill: 1 })
            .limit(50)
            .lean();

        const skills = skillsResult.map((row) => row.Skill);

        res.status(200).json({
            success: true,
            data: skills,
            message: `Matching skills for "${skill_name}"`,
        });
    } catch (error) {
        console.error("MongoDB error →", error);
        res.status(500).json({ success: false, message: "Database query failed" });
    }
};


/**
 * @description Get all Education Level from the database
 * @route GET /api/sql/dropdown/education_level
 * @success {object} 200 - All Education Level
 * @error {object} 500 - Database query failed
 */
export const getEducationLevel = async (req, res) => {
    try {
        const [rows] = await db_sql.execute(
            "SELECT id , level, duration ,type FROM `education_level` WHERE is_del = 0 AND is_active = 1;"
        );

        res.status(200).json({
            success: true,
            data: rows,
            message: "All Education Level",
        });
    } catch (error) {
        console.error("MySQL error →", error); // 👈 Add this
        res.status(500).json({ success: false, message: "Database query failed" });
    }
};

/**
 * @description Get all University State from the database
 * @route GET /api/sql/dropdown/all_university_state
 * @success {object} 200 - All University States
 * @error {object} 500 - Database query failed
 */
export const getAllState = async (req, res) => {
    try {
        const [rows] = await db_sql.execute(
            "SELECT id, name FROM `university_state` WHERE is_del = 0 AND is_active = 1 ORDER BY name ASC;"
        );

        res.status(200).json({
            success: true,
            data: rows,
            message: "All University States",
        });
    } catch (error) {
        console.error("MySQL error →", error); // 👈 Add this
        res.status(500).json({ success: false, message: "Database query failed" });
    }
};

/**
 * @description Get all University By State from the database
 * @route GET /api/sql/dropdown/university_state?state_id=4
 * @success {object} 200 - Universities in state ID ${stateId}
 * @error {object} 500 - Database query failede
 */
export const getUniversityByState = async (req, res) => {
    try {
        const stateId = req.query.state_id;

        if (!stateId) {
            return res
                .status(400)
                .json({ success: false, message: "Missing state_id in query." });
        }

        const [rows] = await db_sql.execute(
            "SELECT id, name FROM `university_univercity` WHERE state_id = ? AND is_del = 0 AND is_active = 1;",
            [stateId]
        );
        const universityNames = rows.map((row) => row.name);

        res.status(200).json({
            success: true,
            data: universityNames,
            message: `Universities in state ID ${stateId}`,
        });
    } catch (error) {
        console.error("MySQL error →", error); // 👈 Add this
        res.status(500).json({ success: false, message: "Database query failed" });
    }
};

/**
 * @description Retrieve courses offered by a specific university, filtered by state, college, and course type.
 * @route GET /api/sql/dropdown/university_course
 * @param {string} req.query.state_id - The ID of the state where the university is located.
 * @param {string} req.query.university_id - The name of the university.
 * @param {string} req.query.college_name - The name of the college within the university.
 * @param {string} req.query.course_type - The type of course to filter by.
 * @returns {object} 200 - An array of course names that match the filters.
 * @returns {object} 400 - If the course_type parameter is missing or empty.
 * @returns {object} 404 - If no courses are found matching the given criteria.
 * @returns {object} 500 - If there is an error executing the database query.
 */
export const getCourseByUniversity = async (req, res) => {
    try {
        const { state_id, university_id, college_name, course_type } = req.query;
        let courseIds = [];
        const allFiltersProvided =
            state_id && university_id && college_name && course_type;

        if (allFiltersProvided) {
            const [universityIdResult] = await db_sql.execute(
                "SELECT id FROM university_univercity WHERE name = ? AND is_del = 0 AND is_active = 1",
                [university_id.trim()]
            );

            if (universityIdResult.length > 0) {
                const universityId = universityIdResult[0].id;

                const [universityRows] = await db_sql.execute(
                    "SELECT id FROM university_univercity WHERE id = ? AND state_id = ? AND is_del = 0 AND is_active = 1",
                    [universityId, state_id]
                );

                if (universityRows.length > 0) {
                    const [collegeRows] = await db_sql.execute(
                        "SELECT courses FROM university_college WHERE university_id = ? AND name = ? AND is_del = 0 AND is_active = 1",
                        [universityId, college_name.trim()]
                    );

                    if (collegeRows.length > 0 && collegeRows[0].courses) {
                        courseIds = collegeRows[0].courses
                            .split(",")
                            .map((id) => id.trim())
                            .filter(Boolean);
                    }
                }
            }
        }

        let courseQuery = "";
        let queryValues = [];

        if (courseIds.length > 0) {
            // Filtered query
            courseQuery = `
        SELECT id, name 
        FROM university_course 
        WHERE id IN (${courseIds.map(() => "?").join(",")})
        AND type = ?
        AND is_del = 0
        AND is_active = 1
        LIMIT 50
      `;
            queryValues = [...courseIds, course_type];
        } else {
            // Fallback query (filter only by course_type)
            courseQuery = `
        SELECT id, name 
        FROM university_course 
        WHERE type = ?
        AND is_del = 0
        AND is_active = 1
        LIMIT 50
      `;
            queryValues = [course_type];
        }

        const [courseRows] = await db_sql.execute(courseQuery, queryValues);

        let finalCourseNames = courseRows.map((row) => row.name);

        // If no course found, get fallback list (NA)
        if (finalCourseNames.length === 0) {
            const [naCourseRows] = await db_sql.execute(`
        SELECT id, name 
        FROM university_course 
        WHERE is_del = 0 
        AND is_active = 1 
        LIMIT 50
      `);

            finalCourseNames = naCourseRows.map((row) => row.name);

            if (finalCourseNames.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "No courses found in the database",
                });
            }
        }

        // Single response
        return res.status(200).json({
            success: true,
            data: finalCourseNames,
            message: "Courses based on provided filters",
        });
    } catch (error) {
        console.error("MySQL error →", error);
        return res
            .status(500)
            .json({ success: false, message: "Database query failed" });
    }
};

/**
 * @description Get all Grading System from the database
 * @route GET /api/sql/dropdown/grading_system
 * @success {object} 200 - All Grading Systems
 * @error {object} 500 - Database query failed
 */
export const getGradingSystem = async (req, res) => {
    try {
        const [rows] = await db_sql.execute(
            "SELECT id, name FROM `grading_system` WHERE is_del = 0 AND is_active = 1;"
        );

        res.status(200).json({
            success: true,
            data: rows,
            message: "All Grading Systems",
        });
    } catch (error) {
        console.error("MySQL error →", error); // 👈 Add this
        res.status(500).json({ success: false, message: "Database query failed" });
    }
};

/**
 * @description Get all Course Type from the database
 * @route GET /api/sql/dropdown/course_type
 * @success {object} 200 - All Course Type
 * @error {object} 500 - Database query failed
 */
export const getCourseType = async (req, res) => {
    try {
        const [rows] = await db_sql.execute(
            "SELECT id, name FROM `course_type` WHERE is_del = 0 AND is_active = 1;"
        );

        res.status(200).json({
            success: true,
            data: rows,
            message: "All Course Type",
        });
    } catch (error) {
        console.error("MySQL error →", error); // 👈 Add this
        res.status(500).json({ success: false, message: "Database query failed" });
    }
};

/**
 * @description Get all State Wise Board from the database
 * @route GET /api/sql/dropdown/state_wise_board?state_id=6
 * @success {object} 200 - State Wise Education Board
 * @error {object} 500 - Database query failed
 */
export const getEducationBoardById = async (req, res) => {
    try {
        const boardId = req.query.state_id;

        const [rows] = await db_sql.execute(
            "SELECT id, board_name FROM education_boards WHERE state_region_id = ? OR state_region_id = 0",
            [boardId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Education Board not found",
            });
        }

        const boardNames = rows.map((row) => row.board_name);

        res.status(200).json({
            success: true,
            data: boardNames,
            message: "Education Board details",
        });
    } catch (error) {
        console.error("MySQL error →", error);
        res.status(500).json({ success: false, message: "Database query failed" });
    }
};

/**
 * @description Get all Medium Of Education from the database
 * @route GET /api/sql/dropdown/medium_of_education
 * @success {object} 200 - All Medium
 * @error {object} 500 - Database query failed
 */
export const getAllMediumOfEducation = async (req, res) => {
    try {
        const [rows] = await db_sql.execute(
            "SELECT id, name FROM `medium_of_education` WHERE is_del = 0 AND is_active = 1;"
        );

        res.status(200).json({
            success: true,
            data: rows,
            message: "All Medium Of Education",
        });
    } catch (error) {
        console.error("MySQL error →", error);
        res.status(500).json({ success: false, message: "Database query failed" });
    }
};

/**
 * @description Get all College Name based on University Id from the database
 * @route GET api/sql/dropdown/college_name?university_id=SBS34545%20College&state_id=32
 * @success {object} 200 - College Name based on University Id
 * @error {object} 500 - Database query failed
 */
export const getCollegeNameById = async (req, res) => {
    try {
        const university_name = req.query.university_id;
        const university_state = req.query.state_id;

        if (!university_name || university_name.trim() === "") {
            return res
                .status(400)
                .json({ success: false, message: "university_name is required" });
        }

        if (!university_state) {
            return res
                .status(400)
                .json({ success: false, message: "state_id is required" });
        }

        const [existingUniversity] = await db_sql.execute(
            "SELECT id FROM university_univercity WHERE name = ? AND state_id = ? AND is_del = 0 AND is_active = 1",
            [university_name.trim(), university_state]
        );

        let universityId;
        let collegeRows = [];

        if (existingUniversity.length > 0) {
            universityId = existingUniversity[0].id;

            [collegeRows] = await db_sql.execute(
                "SELECT id,name FROM university_college WHERE university_id = ? AND is_del = 0 AND is_active = 1;",
                [universityId]
            );

            if (collegeRows.length === 0) {
                [collegeRows] = await db_sql.execute(
                    "SELECT id, name FROM university_college WHERE is_del = 0 AND is_active = 1 LIMIT 50"
                );
            }
        } else {
            const [insertResult] = await db_sql.execute(
                "INSERT INTO university_univercity (name, state_id, is_active, is_del, flag) VALUES (?, ?, 0, 0, 1)",
                [university_name.trim(), university_state]
            );

            universityId = insertResult.insertId;
            [collegeRows] = await db_sql.execute(
                "SELECT id, name FROM university_college WHERE is_del = 0 AND is_active = 1 LIMIT 50"
            );
        }

        if (collegeRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "College Name not found",
            });
        }
        const collegeNames = collegeRows.map((row) => row.name);

        res.status(200).json({
            success: true,
            data: collegeNames,
            message: "College Name based on University Id",
        });
    } catch (error) {
        console.error("MySQL error →", error);
        res.status(500).json({ success: false, message: "Database query failed" });
    }
};

/**
 * @description Get all more information from the database
 * @route GET /api/sql/dropdown/more_information
 * @success {object} 200 - All more information
 * @error {object} 500 - Database query failed
 */
export const getMoreInformation = async (req, res) => {
    try {
        const infoList = await list_more_information.find(
            { is_del: 0, is_active: 1 },
            "id name" // project only `id` and `name`
        ).lean();

        // Transform _id to id
        const formattedInfoList = infoList.map((items) => ({
            id: items._id,
            name: items.name,
        }));

        res.status(200).json({
            success: true,
            data: formattedInfoList,
            message: "More Information",
        });
    } catch (error) {
        console.error("MySQL error →", error);
        res.status(500).json({ success: false, message: "Database query failed" });
    }
};

/**
 * @description Get all marital statuses from the database
 * @route GET /api/sql/dropdown/marital_status
 * @success {object} 200 - All marital statuses
 * @error {object} 500 - Database query failed
 */
export const getMaritalStatus = async (req, res) => {
    try {
        const maritalStatusList = await list_marital_status.find(
            { is_del: 0, is_active: 1 },
            "_id status" // project only `id` and `name`
        ).lean();

        //Transform _id to id
        const formattedMaritalStatusList = maritalStatusList.map((items) => ({
            id: items._id,
            status: items.status
        }));

        res.status(200).json({
            success: true,
            data: formattedMaritalStatusList,
            message: "Martital Status Fetched Successfully",
        });
    } catch (error) {
        console.error("MySQL error →", error);
        res.status(500).json({ success: false, message: "Database query failed" });
    }
};

/**
 * @description Get all categories from the database
 * @route GET /api/sql/dropdown/category_details
 * @success {object} 200 - All categories
 * @error {object} 500 - Database query failed
 */
export const getCategoryDetails = async (req, res) => {
    try {
        // list_category
        const categoryList = await list_category.find(
            { is_del: 0, is_active: 1 },
            "_id category_name" // project only `id` and `name`
        ).lean();

        //Transform _id to id
        const formattedCategoryList = categoryList.map((items) => ({
            id: items._id,
            category_name: items.category_name
        }));

        res.status(200).json({
            success: true,
            data: formattedCategoryList,
            message: "Category Details Fetched Successfully",
        });
    } catch (error) {
        console.error("MySQL error →", error);
        res.status(500).json({ success: false, message: "Database query failed" });
    }
};

/**
 * @description Get all Visa Type from the database
 * @route GET /api/sql/dropdown/visa_type
 * @success {object} 200 - All Visa Types
 * @error {object} 500 - Database query failed
 */
export const getVisaType = async (req, res) => {
    try {
        const visaTypeList = await list_visa_type.find(
            { is_del: 0, is_active: 1 },
            "_id visa_name" // project only `id` and `name`
        ).lean();

        //Transform _id to id
        const formattedVisaTypeList = visaTypeList.map((items) => ({
            id: items._id,
            visa_name: items.visa_name
        }));

        res.status(200).json({
            success: true,
            data: formattedVisaTypeList,
            message: "Visa Type Fetched Successfully",
        });
    } catch (error) {
        console.error("MySQL error →", error);
        res.status(500).json({ success: false, message: "Database query failed" });
    }
};

/**
 * @description Get all Disability Type from the database
 * @route GET /api/sql/dropdown/disability_type
 * @success {object} 200 - All Disability Types
 * @error {object} 500 - Database query failed
 */
export const getDisabilityType = async (req, res) => {
    try {
        const [rows] = await db_sql.execute(
            "SELECT id, name FROM `disability_type` WHERE is_del = 0 AND is_active = 1;"
        );

        res.status(200).json({
            success: true,
            data: rows,
            message: "Disability Fetched Successfully",
        });
    } catch (error) {
        console.error("MySQL error →", error);
        res.status(500).json({ success: false, message: "Database query failed" });
    }
};

/**
 * @description Get all Career Break Reasons from the database
 * @route GET /api/sql/dropdown/career_break_reason
 * @success {object} 200 - Career Break Reasons
 * @error {object} 500 - Database query failed
 */
export const getCareerBreakReason = async (req, res) => {
    try {
        // list_category
        // list_career_break_reason
        const breakList = await list_career_break_reason.find(
            { is_del: 0, is_active: 1 },
            "_id name" // project only `id` and `name`
        ).lean();

        //Transform _id to id
        const formattedBreakList = breakList.map((items) => ({
            id: items._id,
            name: items.name
        }));

        res.status(200).json({
            success: true,
            data: formattedBreakList,
            message: "Career Break Reason Fetched Successfully",
        });
    } catch (error) {
        console.error("MySQL error →", error);
        res.status(500).json({ success: false, message: "Database query failed" });
    }
};

/**
 * @description Get all languages from the database
 * @route GET /api/sql/dropdown/language
 * @success {object} 200 - All languages
 * @error {object} 500 - Database query failed
 */
export const getLanguage = async (req, res) => {
    try {
        const [rows] = await db_sql.execute(
            "SELECT id, name FROM `languages` WHERE is_del = 0 AND is_active = 1;"
        );

        res.status(200).json({
            success: true,
            data: rows,
            message: "Languages Fetched Successfully",
        });
    } catch (error) {
        console.error("MySQL error →", error);
        res.status(500).json({ success: false, message: "Database query failed" });
    }
};

/**
 * @description Get all language proficiency from the database
 * @route GET /api/sql/dropdown/language_proficiency
 * @success {object} 200 - All language proficiency
 * @error {object} 500 - Database query failed
 */
export const getLanguageProficiency = async (req, res) => {
    try {
        const [rows] = await db_sql.execute(
            "SELECT id, name FROM `language_proficiency` WHERE is_del = 0 AND is_active = 1;"
        );

        res.status(200).json({
            success: true,
            data: rows,
            message: "Language Proficiency Fetched Successfully",
        });
    } catch (error) {
        console.error("MySQL error →", error);
        res.status(500).json({ success: false, message: "Database query failed" });
    }
};

// path -   /api/sql/dropdown/social_profile

/**
 * @description Get all social profiles from the database
 * @route GET /api/sql/dropdown/social_profile
 * @success {object} 200 - All social profiles
 * @error {object} 500 - Database query failed
 */
export const getSocialProfile = async (req, res) => {
    try {
        const [rows] = await db_sql.execute(
            "SELECT id, name FROM `social_profile` WHERE is_del = 0 AND is_active = 1;"
        );

        res.status(200).json({
            success: true,
            data: rows,
            message: "Social Profile Data Fetched Successfully",
        });
    } catch (error) {
        console.error("MySQL error →", error);
        res.status(500).json({ success: false, message: "Database query failed" });
    }
};

// Get Industry
/**
 * @description Get all industries from the database
 * @route GET /api/sql/dropdown/get_industry
 * @success {object} 200 - All industries
 * @error {object} 500 - Database query failed
 */
export const getIndustry = async (req, res) => {
    try {
        const [rows] = await db_sql.execute(
            "SELECT id, job_industry FROM `industries` WHERE is_del = 0 AND is_active = 1;"
        );

        res.status(200).json({
            success: true,
            data: rows,
            message: "Industries Data Fetched Successfully",
        });
    } catch (error) {
        console.error("MySQL error →", error);
        res.status(500).json({ success: false, message: "Database query failed" });
    }
};

// Get Job Departments
/**
 * @description Get all Job Departments from the database
 * @route GET /api/sql/dropdown/get_job_departments?industry_id=4
 * @success {object} 200 - Job Departments Data
 * @error {object} 500 - Database query failed
 */
export const getJobDepartments = async (req, res) => {
    try {
        const industryId = req.query.industry_id;

        if (!industryId) {
            return res
                .status(400)
                .json({ success: false, message: "Missing industry_id in query." });
        }

        const [rows] = await db_sql.execute(
            "SELECT id, job_department FROM `departments` WHERE industry_id = ? AND is_del = 0 AND is_active = 1;",
            [industryId]
        );

        res.status(200).json({
            success: true,
            data: rows,
            message: "Job Departments Data Fetched Successfully",
        });
    } catch (error) {
        console.error("MySQL error →", error);
        res.status(500).json({ success: false, message: "Database query failed" });
    }
};

// Get Job Roles
/**
 * @description Get all Job Roles from the database
 * @route GET /api/sql/dropdown/get_job_roles?department_id=4
 * @success {object} 200 - Job Roles Data
 * @error {object} 500 - Database query failed
 */
export const getJobRoles = async (req, res) => {
    try {
        const departmentId = req.query.department_id;

        if (!departmentId) {
            return res
                .status(400)
                .json({ success: false, message: "Missing department_id in query." });
        }

        const [rows] = await db_sql.execute(
            "SELECT id, job_role FROM `job_roles` WHERE department_id = ? AND is_del = 0 AND is_active = 1;",
            [departmentId]
        );

        res.status(200).json({
            success: true,
            data: rows,
            message: "Job Roles Data Fetched Successfully",
        });
    } catch (error) {
        console.error("MySQL error →", error);
        res.status(500).json({ success: false, message: "Database query failed" });
    }
};

/**
 * @description Fetch all cities in India from the database
 * @route GET /api/sql/dropdown/get_india_cities
 * @access Public
 * @returns {object} 200 - An array of city objects, sorted by popularity and name
 * @returns {object} 500 - Database query failed
 */
export const getIndiaCities = async (req, res) => {
    try {
        const [rows] = await db_sql.execute(`
      SELECT id, city_name , popular_location
      FROM india_cities
      WHERE is_del = 0 AND is_active = 1
      ORDER BY
      popular_location DESC,
      CASE
        WHEN LOWER(city_name) LIKE '%remote%' THEN 1
        ELSE 0
      END,
      city_name ASC
    `);

        res.status(200).json({
            success: true,
            data: rows,
            message: "All Indian country",
        });
    } catch (error) {
        console.error("MySQL error →", error);
        res.status(500).json({ success: false, message: "Database query failed" });
    }
};

/**
 * @description Get all tech skills from the database
 * @route GET /api/sql/dropdown/get_tech_skills
 * @success {object} 200 - All tech skills
 * @error {object} 500 - Database query failed
 */
export const getTechSkills = async (req, res) => {
    try {
        const [rows] = await db_sql.execute(
            "SELECT name FROM `tech_skills` WHERE is_del = 0 AND is_active = 1;"
        );

        const allSkills = rows.map(
            (row) => row.name.charAt(0).toUpperCase() + row.name.slice(1)
        );

        res.status(200).json({
            success: true,
            data: allSkills,
            message: "Tech Skills Data Fetched Successfully",
        });
    } catch (error) {
        console.error("MySQL error →", error);
        res.status(500).json({ success: false, message: "Database query failed" });
    }
};
