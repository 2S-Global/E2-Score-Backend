import db_sql from "../../config/sqldb.js";
import Employment from "../../models/Employment.js";

/**
 * @description Search for matching Company based on the query parameter company_name
 * @route GET /api/candidate/employment/matching_company?company_name=:company_name
 * @param {string} company_name - The string to search for in the company table
 * @success {object} 200 - Matching Company
 * @error {object} 400 - company_name query parameter is required
 * @error {object} 500 - Database query failed
 */
export const getMatchingCompany = async (req, res) => {
  const { company_name } = req.query;

  if (!company_name || company_name.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "company_name query parameter is required",
    });
  }

  try {
    const [rows] = await db_sql.execute(
      `SELECT NAME FROM company 
       WHERE is_del = 0 AND is_active = 1 AND NAME LIKE ? 
       ORDER BY NAME LIMIT 50;`,
      [`${company_name}%`]
    );

    const company = rows.map((row) => row.NAME);

    res.status(200).json({
      success: true,
      data: company,
      message: `Matching companies for "${company_name}"`,
    });
  } catch (error) {
    console.error("MySQL error →", error);
    res.status(500).json({ success: false, message: "Database query failed" });
  }
};

/**
 * @description Get 50 random company from the database
 * @route GET /api/candidate/employment/random_company
 * @success {object} 200 - Random 50 Company
 * @error {object} 500 - Database query failed
 */
export const getRandomCompany = async (req, res) => {
  try {
    const [rows] = await db_sql.execute(
      "SELECT NAME FROM `company` WHERE is_del = 0 AND is_active = 1 ORDER BY RAND() LIMIT 50;"
    );

    // Convert to array of strings
    const companies = rows.map((row) => row.NAME);

    res.status(200).json({
      success: true,
      data: companies,
      message: "Random 50 Company",
    });
  } catch (error) {
    console.error("MySQL error →", error);
    res.status(500).json({ success: false, message: "Database query failed" });
  }
};

/**
 * @description Add Employment Details for the authenticated user
 * @route POST /api/candidate/employment/add_employment
 * @security BearerAuth
 * @param {object} req.body - Employment Details to add
 * @param {boolean} req.body.currentlyWorking - Current Employment
 * @param {string} req.body.employmenttype - Employment type
 * @param {string} req.body.experience_yr - Total Experience in Year
 * @param {string} req.body.experience_month - Total Experience in Month
 * @param {string} req.body.company_name - Company name
 * @param {string} req.body.job_title - Job title
 * @param {string} req.body.joining_year - Joining Date in year
 * @param {string} req.body.joining_month - Joining Date in month
 * @param {string} req.body.leaving_year - Leaving Date in year
 * @param {string} req.body.leaving_month - Leaving Date in month
 * @param {string} req.body.description - Job profile
 * @returns {object} 201 - Employment Details added successfully!
 * @returns {object} 400 - User ID is required
 * @returns {object} 500 - Error Saving Employment Details
 */
export const addEmploymentDetails = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      currentlyWorking,
      employmenttype,
      experience_yr,
      experience_month,
      company_name,
      job_title,
      joining_year,
      joining_month,
      leaving_year,
      leaving_month,
      description
    } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Checking Company name exist in database. If not exist then insert that value in database
    const [companyName] = await db_sql.execute(
      "SELECT id, NAME FROM company WHERE NAME = ? AND is_del = 0",
      [company_name.trim()]
    );

    let companyId;
    if (companyName.length > 0) {
      companyId = companyName[0].id;
    } else {
      const [insertResult] = await db_sql.execute(
        "INSERT INTO company (name, is_active, is_del, flag) VALUES (?, 0, 0, 1)",
        [company_name.trim()]
      );

      companyId = insertResult.insertId;
    }

    const employment = new Employment({
      user: userId,
      currentEmployment: currentlyWorking,
      employmentType: employmenttype,
      totalExperience: {
        year: experience_yr,
        month: experience_month,
      },
      companyName: companyId,
      jobTitle: job_title,
      joiningDate: {
        year: joining_year,
        month: joining_month,
      },
      leavingDate: {
        year: leaving_year,
        month: leaving_month,
      },
      jobDescription: description,
    });

    await employment.save();

    res.status(201).json({
      success: true,
      message: "Employment Details added successfully!",
      data: employment,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error Saving Employment Details", error: error.message });
  }
};