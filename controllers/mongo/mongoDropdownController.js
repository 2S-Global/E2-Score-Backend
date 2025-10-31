import db_sql from "../../config/sqldb.js";
import list_tbl_countrie from "../../models/monogo_query/countriesModel.js";
import list_gender from "../../models/monogo_query/genderModel.js";
import list_key_skill from "../../models/monogo_query/keySkillModel.js";
import list_more_information from "../../models/monogo_query/moreInformationModel.js";
import list_marital_status from "../../models/monogo_query/maritalStatusModel.js";
import list_category from "../../models/monogo_query/categoryModel.js";
import list_career_break_reason from "../../models/monogo_query/careerBreakReasonModel.js";
import list_visa_type from "../../models/monogo_query/visaTypeModel.js";
import list_language from "../../models/monogo_query/languageModel.js";
import list_language_proficiency from "../../models/monogo_query/languageProficiencyModel.js";
import list_tech_skill from "../../models/monogo_query/techSkillModel.js";
import list_disability_type from "../../models/monogo_query/disabilityType.js";
import list_social_profile from "../../models/monogo_query/socialProfileModel.js";
import list_education_level from "../../models/monogo_query/educationLevelModel.js";
import list_industries from "../../models/monogo_query/industryModel.js";
import list_department from "../../models/monogo_query/departmentsModel.js";
import list_job_role from "../../models/monogo_query/jobRolesModel.js";
import list_india_cities from "../../models/monogo_query/indiaCitiesModel.js";
import list_university_state from "../../models/monogo_query/universityStateModel.js";
import list_university_univercities from "../../models/monogo_query/universityUniversityModel.js";
import list_university_colleges from "../../models/monogo_query/universityCollegesModel.js";
import list_university_course from "../../models/monogo_query/universityCourseModel.js";
import list_medium_of_education from "../../models/monogo_query/mediumOfEducationModel.js";
import list_education_boards from "../../models/monogo_query/educationBoardModel.js";
import list_course_type from "../../models/monogo_query/courseTypeModel.js";
import list_grading_system from "../../models/monogo_query/gradingSystemModel.js";
import list_school_list from "../../models/monogo_query/schoolListModel.js";
import ListVerificationList from "../../models/monogo_query/verificationListModel.js";
import list_non_it_skills from "../../models/monogo_query/nonTechSkillModel.js";

//Get Courses for search

/**
 * @description Get courses matching a search query
 * @param {string} search - case-insensitive search string
 * @returns {Array.<Object>} list of matching courses with id, name, and _id
 * @throws {Error} if database query fails
 */
export const GetCourcesSearch = async (req, res) => {
  try {
    const search = req.query.search?.trim() || "";

    const query = {
      is_del: 0,
      is_active: 1,
      ...(search && { name: { $regex: search, $options: "i" } }), // case-insensitive search
    };

    let data = await list_university_course
      .find(query, { _id: 1, id: 1, name: 1, type: 1 })
      .limit(20);

    // Format: if type exists => name (type)
    data = data.map((item) => ({
      _id: item._id,
      id: item.id,
      name: item.type ? `${item.name} (${item.type})` : item.name,
    }));

    res.status(200).json({
      success: true,
      data,
      message: "Courses fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({
      success: false,
      message: "Database query failed",
    });
  }
};

// Add Course

/**
 * @description Add a new course
 * @param {string} req.body.name - the name of the course
 * @returns {object} 200 - the newly created course
 * @returns {object} 400 - if the course name is missing
 * @returns {object} 500 - if there is an error executing the database query
 */
export const AddCourse = async (req, res) => {
  try {
    const { name, type } = req.body;
    console.log(req.body);

    if (!name || !type) {
      return res.status(400).json({
        success: false,
        message: "Both name and type are required",
      });
    }

    // Case-insensitive duplicate check with type
    const existingCourse = await list_university_course.findOne({
      name: { $regex: `^${name}$`, $options: "i" },
      type,
    });

    if (existingCourse) {
      const data = {
        _id: existingCourse._id,
        id: existingCourse.id,
        name: existingCourse.type
          ? `${existingCourse.name} (${existingCourse.type})`
          : existingCourse.name,
        type: existingCourse.type,
      };

      return res.status(200).json({
        success: true,
        data: [data], // always return array
        message: "Course already exists",
      });
    }

    // Create new course
    const course = new list_university_course({
      name,
      type,
      is_del: 0,
      is_active: 0,
      flag: 1,
    });

    await course.save();

    const formatted = {
      _id: course._id,
      id: course.id,
      name: course.type ? `${course.name} (${course.type})` : course.name,
      type: course.type,
    };

    return res.status(200).json({
      success: true,
      data: [formatted], // return as array for consistency
      message: "Course added successfully",
    });
  } catch (error) {
    console.error("Error adding course:", error);
    res.status(500).json({
      success: false,
      message: "Database query failed",
    });
  }
};

/**
 * @description Get all countries from the database
 * @route GET /api/sql/dropdown/All_contry
 * @success {object} 200 - All countries
 * @error {object} 500 - Database query failed
 */
export const All_country = async (req, res) => {
  try {
    const countries = await list_tbl_countrie.find(
      { is_del: 0, is_active: 1 },
      { _id: 1, id: 1, name: 1 }
    );

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
    const gender = await list_gender.find(
      { is_del: 0, is_active: 1 },
      { _id: 1, name: 1 }
    );

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
    const skillsResult = await list_key_skill
      .find(
        {
          is_del: 0,
          is_active: 1,
          Skill: { $regex: `^${skill_name}`, $options: "i" }, // case-insensitive "starts with"
        },
        "Skill" // project only Skill field
      )
      .sort({ Skill: 1 })
      .limit(5)
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
    // const [rows] = await db_sql.execute(
    //     "SELECT id , level, duration ,type FROM `education_level` WHERE is_del = 0 AND is_active = 1;"
    // );

    const educationLevelList = await list_education_level
      .find(
        { is_del: 0, is_active: 1 },
        "id level duration type" // project only `id` and `name`
      )
      .lean();

    //Transform _id to id
    const formattededucationLevelList = educationLevelList.map((items) => ({
      id: items.id,
      level: items.level,
      duration: items.duration,
      type: items.type || "",
    }));

    res.status(200).json({
      success: true,
      data: formattededucationLevelList,
      message: "All Education Level",
    });
  } catch (error) {
    console.error("MySQL error →", error);
    res.status(500).json({ success: false, message: "Database query failed" });
  }
};

/**
 * @description Get all University State from the s
 * @route GET /api/sql/dropdown/all_university_state
 * @success {object} 200 - All University States
 * @error {object} 500 - Database query failed
 */
export const getAllState = async (req, res) => {
  try {
    const stateList = await list_university_state
      .find({ is_del: 0, is_active: 1 }, { id: 1, name: 1 })
      .sort({ name: 1 })
      .lean();

    //Transform _id to id
    const formattedStateList = stateList.map((items) => ({
      id: items.id,
      name: items.name,
    }));

    res.status(200).json({
      success: true,
      data: formattedStateList,
      message: "All University States",
    });
  } catch (error) {
    console.error("MySQL error →", error);
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

    const universities = await list_university_univercities
      .find({ state_id: stateId, is_del: 0, is_active: 1 }, { name: 1, _id: 0 })
      .lean();

    const universityNames = universities.map((u) => u.name);

    res.status(200).json({
      success: true,
      data: universityNames,
      message: `Universities in state ID ${stateId}`,
    });
  } catch (error) {
    console.error("MySQL error →", error);
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
    let finalCourseNames = [];
    const allFiltersProvided =
      state_id && university_id && college_name && course_type;

    if (allFiltersProvided) {
      const universityIdResult = await list_university_univercities
        .findOne(
          { name: university_id.trim(), is_del: 0, is_active: 1 },
          { id: 1 }
        )
        .lean();

      if (universityIdResult) {
        const universityRows = await list_university_univercities
          .findOne(
            {
              id: universityIdResult.id,
              state_id: state_id,
              is_del: 0,
              is_active: 1,
            },
            { id: 1 }
          )
          .lean();

        if (universityRows) {
          const collegeRows = await list_university_colleges
            .findOne(
              {
                university_id: universityRows.id,
                name: college_name.trim(),
                is_del: 0,
                is_active: 1,
              },
              { courses: 1 }
            )
            .lean();

          if (collegeRows?.courses) {
            courseIds = collegeRows.courses
              .split(",")
              .map((id) => id.trim())
              .filter(Boolean);

            courseIds = [...new Set(courseIds)];
          }
        }
      }
    }
    let filter = {
      is_del: 0,
      is_active: 1,
      type: course_type,
    };

    // Case 1: If courseIds are provided
    if (courseIds.length > 0) {
      filter.id = { $in: courseIds };
    }

    // Query with filter
    const courseDocs = await list_university_course
      .find(filter, { id: 1, name: 1, _id: 0 })
      .limit(50)
      .lean();
    finalCourseNames = courseDocs.map((doc) => doc.name);

    // Step 2: If no courses found, fallback to default course list
    if (finalCourseNames.length === 0) {
      const fallbackCourses = await list_university_course
        .find({ is_del: 0, is_active: 1 }, { id: 1, name: 1, _id: 0 })
        .limit(50)
        .lean();

      finalCourseNames = fallbackCourses.map((doc) => doc.name);

      // If still no courses, return 404
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
    return res
      .status(500)
      .json({ success: false, message: "Database query failed" });
  }
};

/* matching_courses?course_name=${inputValue} */

import stringSimilarity from "string-similarity";

export const getMatchingCourses = async (req, res) => {
  try {
    const { course_name } = req.query;

    if (!course_name || course_name.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Missing or empty course_name parameter",
      });
    }

    // ✅ Escape regex special characters to prevent invalid regex or ReDoS
    const escapeRegex = (text = "") =>
      text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const safeCourseName = escapeRegex(course_name.trim());

    // ✅ Use escaped input in regex
    let matchingCourses = await list_university_course
      .find(
        {
          name: { $regex: safeCourseName, $options: "i" },
          is_del: 0,
          is_active: 1,
        },
        { id: 1, name: 1, _id: 0 }
      )
      .limit(100)
      .lean();

    // 🔥 Sort by similarity (descending)
    matchingCourses.sort((a, b) => {
      const scoreA = stringSimilarity.compareTwoStrings(
        a.name.toLowerCase(),
        course_name.toLowerCase()
      );
      const scoreB = stringSimilarity.compareTwoStrings(
        b.name.toLowerCase(),
        course_name.toLowerCase()
      );
      return scoreB - scoreA;
    });

    // Keep top 50
    matchingCourses = matchingCourses.slice(0, 50);

    return res.status(200).json({
      success: true,
      data: matchingCourses,
      message: "Matching courses found and sorted by relevance",
    });
  } catch (error) {
    console.error("Error in getMatchingCourses:", error);
    return res.status(500).json({
      success: false,
      message: "Database query failed",
      error: error.message,
    });
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
    // const [rows] = await db_sql.execute(
    //     "SELECT id, name FROM `grading_system` WHERE is_del = 0 AND is_active = 1;"
    // );

    const gradingSystem = await list_grading_system
      .find({ is_del: 0, is_active: 1 }, "id name")
      .lean();

    // Transform _id to id
    const formattedGradingSystem = gradingSystem.map((items) => ({
      id: items.id,
      name: items.name,
    }));

    res.status(200).json({
      success: true,
      data: formattedGradingSystem,
      message: "All Grading Systems",
    });
  } catch (error) {
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
    const courseType = await list_course_type
      .find({ is_del: 0, is_active: 1 }, "id name")
      .lean();

    const formattedCourseType = courseType.map((items) => ({
      id: items.id,
      name: items.name,
    }));

    res.status(200).json({
      success: true,
      data: formattedCourseType,
      message: "All Course Type",
    });
  } catch (error) {
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

    const boards = await list_education_boards
      .find(
        {
          $or: [{ state_region_id: boardId }, { state_region_id: 0 }],
          is_active: 1,
        },
        { id: 1, board_name: 1, _id: 0 }
      )
      .lean();

    if (boards.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Education Board not found",
      });
    }

    const boardNames = boards.map((board) => board.board_name);

    res.status(200).json({
      success: true,
      data: boardNames,
      message: "Education Board details",
    });
  } catch (error) {
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
    const educationMedium = await list_medium_of_education
      .find({ is_del: 0, is_active: 1 }, "id name")
      .lean();

    const formattedEducationMedium = educationMedium.map((items) => ({
      id: items.id,
      name: items.name,
    }));

    res.status(200).json({
      success: true,
      data: formattedEducationMedium,
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

    if (!university_name || university_name === "") {
      return res
        .status(400)
        .json({ success: false, message: "university_name is required" });
    }

    if (!university_state) {
      return res
        .status(400)
        .json({ success: false, message: "state_id is required" });
    }

    let existingUniversity = await list_university_univercities
      .findOne({
        name: university_name,
        state_id: university_state,
        is_del: 0,
      })
      .lean();

    let universityId;
    let collegeDocs = [];

    if (existingUniversity) {
      universityId = existingUniversity.id;

      collegeDocs = await list_university_colleges
        .find(
          {
            university_id: universityId,
            is_del: 0,
            is_active: 1,
          },
          { id: 1, name: 1, _id: 0 }
        )
        .lean();

      if (collegeDocs.length === 0) {
        collegeDocs = await list_university_colleges
          .find({ is_del: 0, is_active: 1 }, { id: 1, name: 1, _id: 0 })
          .limit(50)
          .lean();
      }
    } else {
      const lastDoc = await list_university_univercities
        .findOne({})
        .sort({ id: -1 })
        .lean();
      const lastInsertedId = lastDoc?.id || 0;

      const newUniversity = new list_university_univercities({
        id: lastInsertedId + 1,
        name: university_name,
        state_id: university_state,
        is_active: 0,
        is_del: 0,
        flag: 1,
      });

      const savedUniversity = await newUniversity.save();
      universityId = savedUniversity.id;

      // Step 5: Fallback college list
      collegeDocs = await list_university_colleges
        .find({ is_del: 0, is_active: 1 }, { id: 1, name: 1, _id: 0 })
        .limit(50)
        .lean();
    }

    if (collegeDocs.length === 0) {
      return res.status(404).json({
        success: false,
        message: "College Name not found",
      });
    }
    const collegeNames = collegeDocs.map((row) => row.name);

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
    const infoList = await list_more_information
      .find({ is_del: 0, is_active: 1 }, "_id name")
      .lean();

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
    const maritalStatusList = await list_marital_status
      .find({ is_del: 0, is_active: 1 }, "_id status")
      .lean();

    //Transform _id to id
    const formattedMaritalStatusList = maritalStatusList.map((items) => ({
      id: items._id,
      status: items.status,
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
    const categoryList = await list_category
      .find(
        { is_del: 0, is_active: 1 },
        "_id category_name" // project only `id` and `name`
      )
      .lean();

    //Transform _id to id
    const formattedCategoryList = categoryList.map((items) => ({
      id: items._id,
      category_name: items.category_name,
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
    const visaTypeList = await list_visa_type
      .find(
        { is_del: 0, is_active: 1 },
        "_id visa_name" // project only `id` and `name`
      )
      .lean();

    //Transform _id to id
    const formattedVisaTypeList = visaTypeList.map((items) => ({
      id: items._id,
      visa_name: items.visa_name,
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
    const disabilityTypeList = await list_disability_type
      .find({ is_del: 0, is_active: 1 }, "_id name")
      .lean();

    //Transform _id to id
    const formattedDisabilityTypeList = disabilityTypeList.map((items) => ({
      id: items._id,
      name: items.name,
    }));

    res.status(200).json({
      success: true,
      data: formattedDisabilityTypeList,
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
    // list_career_break_reason
    const breakList = await list_career_break_reason
      .find(
        { is_del: 0, is_active: 1 },
        "_id name" // project only `id` and `name`
      )
      .lean();

    //Transform _id to id
    const formattedBreakList = breakList.map((items) => ({
      id: items._id,
      name: items.name,
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
    const languageList = await list_language
      .find(
        { is_del: 0, is_active: 1 },
        "_id name" // project only `id` and `name`
      )
      .lean();

    //Transform _id to id
    const formattedLanguageList = languageList.map((items) => ({
      id: items._id,
      name: items.name,
    }));

    res.status(200).json({
      success: true,
      data: formattedLanguageList,
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
export const getLanguageProficiency234 = async (req, res) => {
  try {
    const proficiencyList = await list_language_proficiency
      .find(
        { is_del: 0, is_active: 1 },
        "_id name" // project only `id` and `name`
      )
      .lean();

    //Transform _id to id
    const formattedProficiencyList = proficiencyList.map((items) => ({
      id: items._id,
      name: items.name,
    }));

    res.status(200).json({
      success: true,
      data: formattedProficiencyList,
      message: "Language Proficiency Fetched Successfully",
    });
  } catch (error) {
    console.error("MySQL error →", error);
    res.status(500).json({ success: false, message: "Database query failed" });
  }
};

export const getLanguageProficiency = async (req, res) => {
  try {
    const proficiencyList = await list_language_proficiency
      .find(
        { is_del: 0, is_active: 1 },
        "_id name" // project only `id` and `name`
      )
      .lean();

    // Transform _id to id and add extra fields based on proficiency
    const formattedProficiencyList = proficiencyList.map((item) => {
      let extraFields = {};

      switch (item.name.toLowerCase()) {
        case "beginner":
          extraFields = { read: true, write: false, speak: false };
          break;
        case "proficient":
          extraFields = { read: true, write: true, speak: false };
          break;
        case "expert":
          extraFields = { read: true, write: true, speak: true };
          break;
        default:
          extraFields = { read: false, write: false, speak: false }; // fallback
      }

      return {
        id: item._id,
        name: item.name,
        ...extraFields,
      };
    });

    res.status(200).json({
      success: true,
      data: formattedProficiencyList,
      message: "Language Proficiency Fetched Successfully",
    });
  } catch (error) {
    console.error("MongoDB error →", error);
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
    const socialProfileList = await list_social_profile
      .find({ is_del: 0, is_active: 1 }, "_id name")
      .lean();

    //Transform _id to id
    const formattedSocialProfileList = socialProfileList.map((items) => ({
      id: items._id,
      name: items.name,
    }));

    res.status(200).json({
      success: true,
      data: formattedSocialProfileList,
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
    const industryList = await list_industries
      .find({ is_del: 0, is_active: 1 }, "id job_industry")
      .lean();

    const formattedIndustryList = industryList.map((items) => ({
      id: items.id,
      job_industry: items.job_industry,
    }));

    res.status(200).json({
      success: true,
      data: formattedIndustryList,
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

    // const [rows] = await db_sql.execute(
    //     "SELECT id, job_department FROM `departments` WHERE industry_id = ? AND is_del = 0 AND is_active = 1;",
    //     [industryId]
    // );

    const jobDepartment = await list_department
      .find({
        industry_id: industryId,
        is_del: 0,
        is_active: 1,
      })
      .select("id job_department")
      .lean();

    const formattedJobDepartment = jobDepartment.map((items) => ({
      id: items.id,
      job_department: items.job_department,
    }));

    res.status(200).json({
      success: true,
      data: formattedJobDepartment,
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
    // list_job_role
    const departmentId = req.query.department_id;

    if (!departmentId) {
      return res
        .status(400)
        .json({ success: false, message: "Missing department_id in query." });
    }

    // const [rows] = await db_sql.execute(
    //     "SELECT id, job_role FROM `job_roles` WHERE department_id = ? AND is_del = 0 AND is_active = 1;",
    //     [departmentId]
    // );

    const departmentList = await list_job_role
      .find({
        department_id: departmentId,
        is_del: 0,
        is_active: 1,
      })
      .select("_id job_role")
      .lean();

    const formattedDepartmentList = departmentList.map((items) => ({
      id: items._id,
      job_role: items.job_role,
    }));

    res.status(200).json({
      success: true,
      data: formattedDepartmentList,
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
    const cities = await list_india_cities.aggregate([
      {
        $match: {
          is_del: 0,
          is_active: 1,
        },
      },
      {
        $addFields: {
          remote_priority: {
            $cond: [
              {
                $regexMatch: {
                  input: { $toLower: "$city_name" },
                  regex: "remote",
                },
              },
              1,
              0,
            ],
          },
        },
      },
      {
        $sort: {
          popular_location: -1,
          remote_priority: 1,
          city_name: 1,
        },
      },
      {
        $project: {
          _id: 1,
          city_name: 1,
          popular_location: 1,
        },
      },
    ]);

    const formattedCities = cities.map((items) => ({
      id: items._id,
      city_name: items.city_name,
      popular_location: items.popular_location,
    }));

    res.status(200).json({
      success: true,
      data: formattedCities,
      message: "All Indian country",
    });
  } catch (error) {
    console.error("MongoDB error →", error);
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
    /* const [rows] = await db_sql.execute(
          "SELECT name FROM `tech_skills` WHERE is_del = 0 AND is_active = 1;"
        ); */
    const rows = await list_tech_skill.find({ is_del: 0, is_active: 1 });

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

/**
 * @description Get all tech skills from the database
 * @route GET /api/sql/dropdown/get_non_tech_skills
 * @success {object} 200 - All tech skills
 * @error {object} 500 - Database query failed
 */
export const getNonTechSkills = async (req, res) => {
  try {
    /* const [rows] = await db_sql.execute(
          "SELECT name FROM `tech_skills` WHERE is_del = 0 AND is_active = 1;"
        ); */
    const rows = await list_non_it_skills.find({ is_del: 0, is_active: 1 });

    const allSkills = rows.map(
      (row) => row.name.charAt(0).toUpperCase() + row.name.slice(1)
    );

    res.status(200).json({
      success: true,
      data: allSkills,
      message: "Non Tech Skills Data Fetched Successfully",
    });
  } catch (error) {
    console.error("MySQL error →", error);
    res.status(500).json({ success: false, message: "Database query failed" });
  }
};

/**
 * @description Get all School from the database
 * @route GET /api/sql/dropdown/get_school_lists
 * @success {object} 200 - All School Lists
 * @error {object} 500 - Database query failed
 */
export const getAllSchoolLists = async (req, res) => {
  try {
    const boardName = req.query.board_name;

    if (!boardName) {
      return res
        .status(400)
        .json({ success: false, message: "Missing board_name in query." });
    }

    const boardDoc = await list_education_boards
      .findOne({ board_name: boardName }, { id: 1, _id: 0 })
      .lean();

    if (!boardDoc) {
      return res.status(404).json({
        success: false,
        message: "Board not found for given board_name.",
      });
    }

    const boardId = boardDoc.id;

    const schoolLists = await list_school_list
      .find(
        { board_id: boardId, is_del: 0, is_active: 1 },
        { id: 1, school_name: 1, _id: 0 }
      )
      .lean();

    const formattedSchoolLists = schoolLists.map((item) => item.school_name);

    res.status(200).json({
      success: true,
      data: formattedSchoolLists,
      message: "All School List data Fetched Successfully",
    });
  } catch (error) {
    console.error("MySQL error →", error);
    res.status(500).json({ success: false, message: "Database query failed" });
  }
};

/**
 * @description Get only student name by user_id
 * @route GET /api/userdata/get_verification_list
 * @access protected
 * @returns {object} 200 - user verification list
 * @returns {object} 500 - Server error
 */

export const getUserVerificationList = async (req, res) => {
  try {
    const verificationList = await ListVerificationList.find({
      isDel: false,
      isActive: true,
    }).select("_id verification_name title fields regex");

    if (!verificationList || verificationList.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Verification List not found",
      });
    }

    res.status(200).json({
      success: true,
      data: verificationList,
      message: "Verification List fetched successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
