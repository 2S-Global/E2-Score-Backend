import db_sql from "../../config/sqldb.js";
import ProjectDetails from "../../models/projectModel.js";

/**
 * @description Get all project tag from the database
 * @route GET /api/candidate/project/get_project_tag
 * @success {object} 200 - Project Tag Data Fetched Successfully
 * @error {object} 500 - Database query failed
 */

export const getProjectTag = async (req, res) => {
  try {
    const [rows] = await db_sql.execute(
      "SELECT _id,name FROM `project_tag` WHERE is_del = 0 AND is_active = 1;"
    );

    res.status(200).json({
      success: true,
      data: rows,
      message: "Project Tag Data Fetched Successfully",
    });
  } catch (error) {
    console.error("MySQL error →", error);
    res.status(500).json({ success: false, message: "Database query failed" });
  }
};

/**
 * @description Add Project Details for the authenticated user
 * @route POST /api/candidate/project/add_project_details
 * @security BearerAuth
 * @param {object} req.body - Project Details to add
 * @param {string} req.body.title.required - Project Title
 * @param {string} req.body.taggedWith - Tag this project with your employment/education
 * @param {string} req.body.client - Client Name
 * @param {string} req.body.status - Project Status
 * @param {string} req.body.workfromyear - Worked from year
 * @param {string} req.body.workfrommonth - Worked from month
 * @param {string} req.body.worktoyear - Worked to year
 * @param {string} req.body.worktomonth - Worked to month
 * @param {string} req.body.description - Description of the project
 * @returns {object} 201 - Project Details added successfully!
 * @returns {object} 400 - title is required
 * @returns {object} 500 - Error Saving Project Details
 */
export const addProjectDetails = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      title,
      taggedWith,
      client,
      status,
      workfromyear,
      workfrommonth,
      worktoyear,
      worktomonth,
      description,
    } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    if (!title) {
      return res.status(400).json({ message: "title is required" });
    }

    const projectDetails = new ProjectDetails({
      userId,
      projectTitle: title,
      taggedWith,
      clientName: client,
      projectStatus: status,
      workedFrom: {
        year: workfromyear,
        month: workfrommonth,
      },
      workedTill: {
        year: worktoyear,
        month: worktomonth,
      },
      description: description,
    });

    await projectDetails.save();
    res.status(201).json({
      success: true,
      message: "Project Details added successfully!",
      data: projectDetails,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error Saving Project Details", error: error.message });
  }
};

/**
 * @description Edit existing Project Details for the authenticated user
 * @route PUT /api/candidate/project/edit_project_details
 * @security BearerAuth
 * @param {object} req.body - Project Details to update
 * @param {string} req.body._id.required - Project ID
 * @param {string} req.body.title.required - Project Title
 * @param {string} req.body.taggedWith - Tag this project with your employment/education
 * @param {string} req.body.client - Client Name
 * @param {string} req.body.status - Project Status
 * @param {string} req.body.workfromyear - Worked from year
 * @param {string} req.body.workfrommonth - Worked from month
 * @param {string} req.body.worktoyear - Worked to year
 * @param {string} req.body.worktomonth - Worked to month
 * @param {string} req.body.description - Description of the project
 * @returns {object} 201 - Project Details updated successfully!
 * @returns {object} 400 - Required fields: _id or title is missing
 * @returns {object} 404 - Project Details not found or already deleted
 * @returns {object} 500 - Error Updating Project Details
 */
export const editProjectDetails = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      _id,
      title,
      taggedWith,
      client,
      status,
      workfromyear,
      workfrommonth,
      worktoyear,
      worktomonth,
      description,
    } = req.body;

    // Required fields check
    if (!userId || !_id) {
      return res.status(400).json({
        message: "Required fields: _id is missing.",
      });
    }

    if (!title) {
      return res.status(400).json({ message: "title is required" });
    }

    // Find the existing document
    const projectDetails = await ProjectDetails.findOne({
      _id,
      userId,
      isDel: false,
    });

    if (!projectDetails) {
      return res.status(404).json({
        success: false,
        message: "Project Details not found or already deleted.",
      });
    }

    projectDetails.projectTitle = title.trim();
    projectDetails.taggedWith = taggedWith ? taggedWith.trim() : "";
    projectDetails.clientName = client ? client.trim() : "";
    projectDetails.projectStatus = status ? status.trim() : "";
    projectDetails.workedFrom = {
      year: workfromyear ? parseInt(workfromyear) : null,
      month: workfrommonth ? parseInt(workfrommonth) : null,
    };
    projectDetails.workedTill = {
      year: worktoyear ? parseInt(worktoyear) : null,
      month: worktomonth ? parseInt(worktomonth) : null,
    };
    projectDetails.description = description ? description.trim() : "";

    projectDetails.updatedAt = new Date();

    await projectDetails.save();

    res.status(201).json({
      success: true,
      message: "Project Details updated successfully!",
      data: projectDetails,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error Updating Project Details",
      error: error.message,
    });
  }
};

/**
 * @description Fetch all Project Details for the authenticated user.
 * @route GET /api/candidate/project/get_project_details
 * @security BearerAuth
 * @returns {object} 200 - Project Details fetched successfully.
 * @returns {object} 400 - User ID is required
 * @returns {object} 404 - Project Details not found or already deleted
 * @returns {object} 500 - Error Fetching Project Details
 */
export const getProjectDetails = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    const projectDetails = await ProjectDetails.find({
      userId,
      isDel: false,
    }).sort({ createdAt: -1 });

    if (!projectDetails || projectDetails.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Project Details not found or already deleted.",
      });
    }

    // Extract unique tag IDs from `taggedWith`
    const tagIds = [
      ...new Set(
        projectDetails
          .map((proj) => proj.taggedWith)
          .filter(Boolean)
          .flatMap((str) => str.split(",").map((id) => id.trim()))
          .filter((id) => !isNaN(id))
      ),
    ];

    // Prepare placeholders (?, ?, ?) for MySQL
    const placeholders = tagIds.map(() => "?").join(",");

    // Get tag names from MySQL
    let tagMap = {};
    if (tagIds.length > 0) {
      const [rows] = await db_sql.execute(
        `SELECT _id, name FROM project_tag WHERE _id IN (${placeholders}) AND is_del = 0 AND is_active = 1`,
        tagIds
      );

      rows.forEach((row) => {
        tagMap[row._id] = row.name;
      });
    }

    // Month names
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

    //  Format response
    const formattedProjects = projectDetails.map((project) => {
      const doc = project._doc;

      const taggedWith = doc.taggedWith || "";
      const firstTagId = taggedWith.split(",")[0]?.trim(); // Take first ID
      const taggedWithName = tagMap[firstTagId] || "";

      return {
        _id: doc._id,
        userId: doc.userId,
        title: doc.projectTitle || "",
        taggedWith: taggedWith,
        taggedWithName: taggedWithName,
        client: doc.clientName || "",
        status: doc.projectStatus || "",
        description: doc.description || "",
        workfromyear: doc.workedFrom?.year || null,
        workfrommonth: doc.workedFrom?.month || null,
        workfrommonth_name: doc.workedFrom?.month
          ? monthNames[doc.workedFrom.month - 1]
          : null,
        worktoyear: doc.workedTill?.year || null,
        worktomonth: doc.workedTill?.month || null,
        worktomonth_name: doc.workedTill?.month
          ? monthNames[doc.workedTill.month - 1]
          : null,
        createdAt: doc.createdAt || null,
        updatedAt: doc.updatedAt || null,
      };
    });

    return res.status(200).json({
      success: true,
      message: "Project Details fetched successfully.",
      data: formattedProjects,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error Fetching Project Details",
      error: error.message,
    });
  }
};

/**
 * @description Soft delete a project by marking it as deleted for the authenticated user
 * @route DELETE /api/candidate/project/delete_project_details
 * @access protected
 * @param {Object} req - Express request object containing userId and project ID in the body
 * @param {Object} res - Express response object
 * @returns {Object} 200 - Project deleted successfully
 * @returns {Object} 400 - Missing user ID or project ID
 * @returns {Object} 404 - Project not found or already deleted
 * @returns {Object} 500 - Error deleting project
 */
export const deleteProjectDetails = async (req, res) => {
  try {
    const { _id } = req.body;
    const userId = req.userId;

    if (!userId || !_id) {
      return res.status(400).json({
        message: "Required fields: _id is missing.",
      });
    }

    const projectDetails = await ProjectDetails.findOne({
      _id,
      userId,
      isDel: false,
    });

    if (!projectDetails) {
      return res.status(404).json({
        success: false,
        message: "Project Details not found or already deleted.",
      });
    }

    projectDetails.isDel = true;
    projectDetails.updatedAt = new Date();
    await projectDetails.save();
    res.status(200).json({
      success: true,
      message: "Project Details deleted successfully!",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting Project Details",
      error: error.message,
    });
  }
};
