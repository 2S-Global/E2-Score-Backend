import db_sql from "../../config/sqldb.js";
import Employment from "../../models/Employment.js";
import companylist from "../../models/CompanyListModel.js";
import list_notice from "../../models/monogo_query/noticeModel.js";

/**
 * @description Search for matching Company based on the query parameter company_name
 * @route GET /api/candidate/employment/matching_company?company_name=:company_name
 * @param {string} company_name - The string to search for in the company table
 * @success {object} 200 - Matching Company
 * @error {object} 400 - company_name query parameter is required
 * @error {object} 500 - Database query failed
 */
export const getMatchingCompanyBySql = async (req, res) => {
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

export const getMatchingCompany = async (req, res) => {
  const { company_name } = req.query;

  if (!company_name || company_name.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "company_name query parameter is required",
    });
  }

  try {
    const companies = await companylist
      .find({
        isDel: false,
        isActive: true,
        companyname: { $regex: `^${company_name}`, $options: "i" }, // prefix + case-insensitive
      })
      .sort({ companyname: 1 })
      .limit(50)
      .select("companyname");

    const companyNames = companies.map((c) => c.companyname);

    res.status(200).json({
      success: true,
      data: companyNames,
      message: `Matching companies for "${company_name}"`,
    });
  } catch (error) {
    console.error("MongoDB error →", error);
    res.status(500).json({
      success: false,
      message: "Database query failed",
    });
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
    const rows = await companylist
      .find({
        isDel: false,
        isActive: true,
      })
      .sort({ companyname: 1 })
      .limit(50);

    // Convert to array of strings
    const companies = rows.map((row) => row.companyname);

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
export const getRandomCompanysql = async (req, res) => {
  try {
    const [rows] = await db_sql.execute(
      "SELECT NAME FROM `company` WHERE is_del = 0 AND is_active = 1 ORDER BY LIMIT 50;"
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
 * @description Get All company details from the database
 * @route GET /api/candidate/employment/all_company_details
 * @success {object} 200 - Company details
 * @error {object} 500 - Database query failed
 */
export const getAllCompany = async (req, res) => {
  const { company_name } = req.query;

  if (!company_name || company_name.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "company_name query parameter is required",
    });
  }

  try {
    const companies = await companylist.find({
      isDel: false,
      isActive: true,
      companyname: company_name.trim(),
    });

    if (companies.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No company found with the name "${company_name}"`,
      });
    }

    res.status(200).json({
      success: true,
      data: companies,
      message: `Company details for "${company_name}"`,
    });
  } catch (error) {
    console.error("MongoDB error →", error);
    res.status(500).json({
      success: false,
      message: "Database query failed",
    });
  }
};

/**
 * @description Get Notice Period from the database
 * @route GET /api/candidate/employment/get_notice_period
 * @success {object} 200 - Notice Period Data fetched successfully !
 * @error {object} 500 - Database query failed
 */
export const getNoticePeriod = async (req, res) => {
  try {
    /* const [rows] = await db_sql.execute(
      "SELECT id , name FROM `notice_period` WHERE is_del = 0 AND is_active = 1;"
    ); */
    const rows = await list_notice.find({ is_del: 0, is_active: 1 });

    res.status(200).json({
      success: true,
      data: rows,
      message: "Notice Period Data fetched successfully !",
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
export const addEmploymentDetailsBySql = async (req, res) => {
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
      description,
      notice_period,
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
      NoticePeriod: notice_period,
    });

    await employment.save();

    res.status(201).json({
      success: true,
      message: "Employment Details added successfully!",
      data: employment,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error Saving Employment Details",
      error: error.message,
    });
  }
};

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
      description,
      notice_period,
    } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const existingCompany = await companylist.findOne({
      companyname: company_name.trim(),
      isDel: false,
    }).select("_id companyname");

    let companyId;
    if (existingCompany) {
      companyId = existingCompany._id;
    } else {
      const newCompany = new companylist({
        companyname: company_name.trim(),
        isActive: false,
        isDel: false,
        flag: 1,
      });
      const savedCompany = await newCompany.save();
      companyId = savedCompany._id;
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
      NoticePeriod: notice_period,
    });

    await employment.save();

    res.status(201).json({
      success: true,
      message: "Employment Details added successfully!",
      data: employment,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error Saving Employment Details",
      error: error.message,
    });
  }
};

/**
 * @description Fetch all Employment Details for the authenticated user.
 * @route GET /api/candidate/employment/get_employment
 * @security BearerAuth
 * @returns {object} 200 - Employment Details fetched successfully.
 * @returns {object} 400 - User ID is required
 * @returns {object} 404 - Employment Details not found or already deleted.
 * @returns {object} 500 - Error Fetching Employment Details
 */
export const getEmploymentDetailsBySql = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    // Fetch employment data
    const employmentData = await Employment.find({
      user: userId,
      isDel: false,
    })
      .sort({ createdAt: -1 })
      .lean();

    if (!employmentData || employmentData.length === 0) {
      return res.status(404).json({
        success: true,
        message: "Employment Details not found or already deleted.",
      });
    }

    // Reusable function to fetch mapping from SQL by ID
    const fetchSqlMapByIds = async (
      tableName,
      idField = "id",
      nameField = "NAME",
      ids = []
    ) => {
      if (!ids.length) return {};

      const placeholders = ids.map(() => "?").join(",");
      const [rows] = await db_sql.execute(
        `SELECT ${idField}, ${nameField} FROM ${tableName} WHERE ${idField} IN (${placeholders})`,
        ids
      );

      const map = {};
      rows.forEach((row) => {
        map[row[idField]] = row[nameField];
      });

      return map;
    };

    // Extract unique company & notice period IDs
    const companyIds = [
      ...new Set(employmentData.map((emp) => emp.companyName).filter(Boolean)),
    ];
    const noticePeriodIds = [
      ...new Set(employmentData.map((emp) => emp.NoticePeriod).filter(Boolean)),
    ];

    // Fetch maps
    const [companyMap, noticePeriodMap] = await Promise.all([
      fetchSqlMapByIds("company", "id", "NAME", companyIds),
      fetchSqlMapByIds("notice_period", "id", "name", noticePeriodIds),
    ]);

    // Month names
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

    // Format response
    const formatted = employmentData.map((item) => {
      const joiningMonth = item.joiningDate?.month || "";
      const leavingMonth = item.leavingDate?.month || "";

      return {
        _id: item._id,
        currentlyWorking: item.currentEmployment || false,
        employmenttype: item.employmentType || "",
        experience_yr: item.totalExperience?.year?.toString() || "",
        experience_month: item.totalExperience?.month?.toString() || "",
        company_name: companyMap[item.companyName] || "",
        company_id: item.companyName || "",
        job_title: item.jobTitle || "",
        joining_year: item.joiningDate?.year || "",
        joining_month: joiningMonth,
        joining_month_name: joiningMonth ? monthNames[joiningMonth] : "",
        leaving_year: item.leavingDate?.year || "",
        leaving_month: leavingMonth,
        leaving_month_name: leavingMonth ? monthNames[leavingMonth] : "",
        description: item.jobDescription || "",
        isVerified: item.isVerified,
        jobTypeVerified: item.jobTypeVerified,
        jobDurationVerified: item.jobDurationVerified,
        notice_period: item.NoticePeriod || "",
        notice_period_name: noticePeriodMap[item.NoticePeriod] || "",
      };
    });

    return res.status(200).json({
      success: true,
      message: "Employment Details fetched successfully.",
      data: formatted,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      message: "Error Fetching Employment Details",
      error: error.message,
    });
  }
};

export const getEmploymentDetails = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    // Fetch employment data
    const employmentData = await Employment.find({
      user: userId,
      isDel: false,
    })
      .sort({ createdAt: -1 })
      .lean();

    if (!employmentData || employmentData.length === 0) {
      return res.status(404).json({
        success: true,
        message: "Employment Details not found or already deleted.",
      });
    }

    const companyIds = [
      ...new Set(employmentData.map((emp) => emp.companyName?.toString()).filter(Boolean)),
    ];
    const noticePeriodIds = [
      ...new Set(employmentData.map((emp) => emp.NoticePeriod?.toString()).filter(Boolean)),
    ];

    // Fetch companies
    const companies = await companylist.find({
      _id: { $in: companyIds },
    }).select("_id companyname").lean();

    const noticePeriods = await list_notice.find({
      id: { $in: noticePeriodIds },
    }).select("id name").lean();

     // Map data by id for quick lookup
    const companyMap = Object.fromEntries(companies.map((c) => [c._id.toString(), c.companyname]));
    const noticePeriodMap = Object.fromEntries(noticePeriods.map((n) => [n.id.toString(), n.name]));

    // Month names
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

    // Format response
    const formatted = employmentData.map((item) => {
      const joiningMonth = item.joiningDate?.month || "";
      const leavingMonth = item.leavingDate?.month || "";

      return {
        _id: item._id,
        currentlyWorking: item.currentEmployment || false,
        employmenttype: item.employmentType || "",
        experience_yr: item.totalExperience?.year?.toString() || "",
        experience_month: item.totalExperience?.month?.toString() || "",
        company_name: companyMap[item.companyName] || "",
        company_id: item.companyName || "",
        job_title: item.jobTitle || "",
        joining_year: item.joiningDate?.year || "",
        joining_month: joiningMonth,
        joining_month_name: joiningMonth ? monthNames[joiningMonth] : "",
        leaving_year: item.leavingDate?.year || "",
        leaving_month: leavingMonth,
        leaving_month_name: leavingMonth ? monthNames[leavingMonth] : "",
        description: item.jobDescription || "",
        isVerified: item.isVerified,
        jobTypeVerified: item.jobTypeVerified,
        jobDurationVerified: item.jobDurationVerified,
        notice_period: item.NoticePeriod || "",
        notice_period_name: noticePeriodMap[item.NoticePeriod] || "",
      };
    });

    return res.status(200).json({
      success: true,
      message: "Employment Details fetched successfully.",
      data: formatted,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      message: "Error Fetching Employment Details",
      error: error.message,
    });
  }
};

/**
 * @description Update an existing Employment Details for the authenticated user.
 * @route PUT /api/candidate/employment/edit_employment
 * @param {object} req.body - Employment Details to update
 * @param {string} req.body._id.required - ID of the Employment Details to update
 * @param {boolean} [req.body.currentlyWorking] - Updated Currently Working
 * @param {string} [req.body.employmenttype] - Updated Employment type
 * @param {string|number} [req.body.experience_yr] - Updated Total Experience in Year
 * @param {string|number} [req.body.experience_month] - Updated Total Experience in Month
 * @param {boolean} [req.body.company_name] - Updated Company name
 * @param {string} [req.body.job_title] - Updated Job title
 * @param {string|number} [req.body.joining_year] - Updated Joining Date in year
 * @param {string|number} [req.body.joining_month] - Updated Joining Date in month
 * @param {string|number} [req.body.leaving_year] - Updated Leaving Date in year
 * @param {string|number} [req.body.leaving_month] - Updated Leaving Date in month
 * @param {string} [req.body.description] - Updated Job profile
 * @returns {object} 200 - Employment Details updated successfully!
 * @returns {object} 400 - _id is required for updating employment
 * @returns {object} 404 - Employment record not found
 * @returns {object} 500 - Error Saving Employment Details
 */

export const editEmploymentDetails = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    const {
      _id,
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
      description,
      notice_period,
    } = req.body;

    if (!_id) {
      return res
        .status(400)
        .json({ message: "_id is required for updating employment" });
    }

    const existingEmployment = await Employment.findOne({
      _id,
      user: userId,
      isDel: false,
    });
    if (!existingEmployment) {
      return res.status(404).json({ message: "Employment record not found" });
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

    // Prepare updated fields
    const updatedFields = {
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
      NoticePeriod: notice_period,
    };

    const updatedEmployment = await Employment.findByIdAndUpdate(
      _id,
      updatedFields,
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Employment Details updated successfully!",
      data: updatedEmployment,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error Saving Employment Details",
      error: error.message,
    });
  }
};

/**
 * @description Delete an existing Employment Details from the authenticated user's profile.
 * @route DELETE /api/candidate/employment/delete_employment
 * @security BearerAuth
 * @param {object} req.body - Employment Details to delete
 * @param {string} req.body._id.required - ID of the Employment Details to delete
 * @returns {object} 200 - Employment Details deleted successfully
 * @returns {object} 400 - Required fields missing
 * @returns {object} 404 - Employment Details not found or already deleted
 * @returns {object} 500 - Error deleting Employment Details
 */
export const deleteEmploymentDetails = async (req, res) => {
  try {
    const { _id } = req.body;
    const userId = req.userId;

    // Find the existing document
    const employmentDetails = await Employment.findOne({
      _id,
      userId,
      isDel: false,
    });

    if (!employmentDetails) {
      return res.status(404).json({
        success: false,
        message: "Employment Details not found or already deleted.",
      });
    }

    // Soft delete: mark as deleted
    employmentDetails.isDel = true;
    await employmentDetails.save();

    res.status(200).json({
      success: true,
      message: "Employment Details deleted successfully!",
      data: employmentDetails,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting Employment Details",
      error: error.message,
    });
  }
};
