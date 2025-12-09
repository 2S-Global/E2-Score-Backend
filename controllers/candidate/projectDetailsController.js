import db_sql from "../../config/sqldb.js";
import ProjectDetails from "../../models/projectModel.js";
import list_project_tag from "../../models/monogo_query/project_tagModel.js";
import mongoose from "mongoose";
import User from "../../models/userModel.js";
import nodemailer from "nodemailer";
/**
 * @description Get all project tag from the database
 * @route GET /api/candidate/project/get_project_tag
 * @success {object} 200 - Project Tag Data Fetched Successfully
 * @error {object} 500 - Database query failed
 */

export const getProjectTag = async (req, res) => {
  try {
    //fetch all project tag
    const rows = await list_project_tag.find({
      is_del: 0,
      is_active: 1,
    });

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

    const userdtl = await User.findById(userId);

    const htmlEmail = `
      <div style="font-family: Arial, sans-serif; color:#333; padding:20px; line-height:1.6; max-width:600px; margin:auto; background:#f9f9f9; border-radius:8px;">
         <div>
    <img src= "${process.env.CLIENT_BASE_URL_TEMP}/images/emailheader/addproject.png"
         alt="GEISIL Banner" 
         style="width:100%; border-radius:8px 8px 0 0; display:block;" />
  </div>
        <div style="background:#0052cc; padding:15px 20px; border-radius:8px 8px 0 0;">
          <h2 style="color:#fff; margin:0; font-size:20px;"> Project Details Update Notification</h2>
        </div>
    
        <div style="padding:20px; background:#ffffff; border-radius:0 0 8px 8px;">
          <p>Dear <strong>${userdtl.name}</strong>,</p>
              
           <p>New project details have been <strong>added</strong> to your profile.</p>
                
          <p>If you did not make this change, please contact support immediately.</p>
    
          <p>You can access your dashboard using the link below:</p>
    
          <p>
            <a href="${process.env.ORIGIN}" 
              style="background:#0052cc; color:#fff; padding:10px 16px; text-decoration:none; border-radius:5px; display:inline-block;">
              Visit Dashboard
            </a>
          </p>
    
          <p>If the button does not work, use this link:</p>
          <p><a href="${process.env.ORIGIN}" style="color:#0052cc;">${process.env.ORIGIN}</a></p>
    
          <br />
    
          <p>Sincerely,<br />
          <strong>Admin Team</strong><br />
          Global Employability Information Services India Limited
          </p>
        </div>
      </div>
      `;

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Geisil Team" <${process.env.EMAIL_USER}>`,
      to: userdtl.email,
      subject: "Project Details Update Notification",
      html: htmlEmail,
    };
    await transporter.sendMail(mailOptions);

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

    const userdtl = await User.findById(userId);

    const htmlEmail = `
      <div style="font-family: Arial, sans-serif; color:#333; padding:20px; line-height:1.6; max-width:600px; margin:auto; background:#f9f9f9; border-radius:8px;">
          <div>
    <img src= "${process.env.CLIENT_BASE_URL_TEMP}/images/emailheader/editprojects.png"
         alt="GEISIL Banner" 
         style="width:100%; border-radius:8px 8px 0 0; display:block;" />
  </div>
        <div style="background:#0052cc; padding:15px 20px; border-radius:8px 8px 0 0;">
          <h2 style="color:#fff; margin:0; font-size:20px;"> Project Details Update Notification</h2>
        </div>
    
        <div style="padding:20px; background:#ffffff; border-radius:0 0 8px 8px;">
          <p>Dear <strong>${userdtl.name}</strong>,</p>
              
          <p>Your project details have been <strong>updated</strong> on your profile.</p>
              
          <p>If you did not make this change, please contact support immediately.</p>
    
          <p>You can access your dashboard using the link below:</p>
    
          <p>
            <a href="${process.env.ORIGIN}" 
              style="background:#0052cc; color:#fff; padding:10px 16px; text-decoration:none; border-radius:5px; display:inline-block;">
              Visit Dashboard
            </a>
          </p>
    
          <p>If the button does not work, use this link:</p>
          <p><a href="${process.env.ORIGIN}" style="color:#0052cc;">${process.env.ORIGIN}</a></p>
    
          <br />
    
          <p>Sincerely,<br />
          <strong>Admin Team</strong><br />
    Global Employability Information Services India Limited</p>
        </div>
      </div>
      `;

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Geisil Team" <${process.env.EMAIL_USER}>`,
      to: userdtl.email,
      subject: "Project Details Update Notification",
      html: htmlEmail,
    };
    await transporter.sendMail(mailOptions);

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

    const formattedProjects = await Promise.all(
      projectDetails.map(async (project) => {
        const doc = project._doc;
        const taggedWith = doc.taggedWith || "";

        let taggedWithName = null;
        if (taggedWith && mongoose.Types.ObjectId.isValid(taggedWith)) {
          const tag = await list_project_tag.findOne({
            _id: new mongoose.Types.ObjectId(taggedWith),
          });
          taggedWithName = tag?.name || null;
        }

        return {
          _id: doc._id,
          userId: doc.userId,
          title: doc.projectTitle || "",
          taggedWith,
          taggedWithName,
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
      })
    );

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

    const userdtl = await User.findById(userId);

    const htmlEmail = `
      <div style="font-family: Arial, sans-serif; color:#333; padding:20px; line-height:1.6; max-width:600px; margin:auto; background:#f9f9f9; border-radius:8px;">
        <div>
    <img src= "${process.env.CLIENT_BASE_URL_TEMP}/images/emailheader/deleteprojects.png"
         alt="GEISIL Banner" 
         style="width:100%; border-radius:8px 8px 0 0; display:block;" />
  </div>
        <div style="background:#0052cc; padding:15px 20px; border-radius:8px 8px 0 0;">
          <h2 style="color:#fff; margin:0; font-size:20px;"> Project Details Update Notification</h2>
        </div>
    
        <div style="padding:20px; background:#ffffff; border-radius:0 0 8px 8px;">
          <p>Dear <strong>${userdtl.name}</strong>,</p>
              
         <p>One of your project details have been <strong>Deleted</strong> from your profile.</p>
          
          <p>If you did not make this change, please contact support immediately.</p>
    
          <p>You can access your dashboard using the link below:</p>
    
          <p>
            <a href="${process.env.ORIGIN}" 
              style="background:#0052cc; color:#fff; padding:10px 16px; text-decoration:none; border-radius:5px; display:inline-block;">
              Visit Dashboard
            </a>
          </p>
    
          <p>If the button does not work, use this link:</p>
          <p><a href="${process.env.ORIGIN}" style="color:#0052cc;">${process.env.ORIGIN}</a></p>
    
          <br />
    
          <p>Sincerely,<br />
          <strong>Admin Team</strong><br />
          Global Employability Information Services India Limited</p>
        </div>
      </div>
      `;

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Geisil Team" <${process.env.EMAIL_USER}>`,
      to: userdtl.email,
      subject: "Project Details Update Notification",
      html: htmlEmail,
    };
    await transporter.sendMail(mailOptions);

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
