import Itskill from "../../models/itskillModel.js";
import getTechSkills from "../../models/monogo_query/techSkillModel.js";
import Otherskill from "../../models/OtherSkillModel.js";
import list_non_tech_skill from "../../models/monogo_query/nonTechSkillModel.js";
import User from "../../models/userModel.js";
import nodemailer from "nodemailer";
import mongoose from "mongoose";
export const getOrInsertId = async (value) => {
  try {
    // 1. Normalize input (optional)
    const trimmedValue = value.trim();

    // 2. Check if skill already exists
    const existingSkill = await getTechSkills.findOne({ name: trimmedValue });

    if (existingSkill) {
      return existingSkill._id;
    }

    // 3. If not found, insert new skill
    const newSkill = await getTechSkills.create({
      name: trimmedValue,
      is_del: 0,
      is_active: 0,
      flag: 1,
    });

    return newSkill._id;
  } catch (error) {
    console.error("DB Error in getOrInsertId →", error.message);
    throw error;
  }
};

export const giveIDgetname = async (value) => {
  try {
    if (!value || !mongoose.Types.ObjectId.isValid(value)) {
      return "Unknown Skill";
    }

    const skill = await getTechSkills.findById(
      new mongoose.Types.ObjectId(value)
    );

    if (!skill) return "Unknown Skill";

    const name = skill.name || "Unknown Skill";
    return name.charAt(0).toUpperCase() + name.slice(1);
  } catch (error) {
    console.error("DB Error in giveIDgetname →", error.message);
    throw error;
  }
};

export const giveIDgetnameForOtherSkill = async (value) => {
  try {
    if (!value || !mongoose.Types.ObjectId.isValid(value)) {
      return "Unknown Skill";
    }

    const skill = await list_non_tech_skill.findById(
      new mongoose.Types.ObjectId(value)
    );

    if (!skill) return "Unknown Skill";

    const name = skill.name || "Unknown Skill";
    return name.charAt(0).toUpperCase() + name.slice(1);
  } catch (error) {
    console.error("DB Error in giveIDgetname →", error.message);
    throw error;
  }
};

export const getOrInsertIdForOtherSkill = async (value) => {
  try {
    // 1. Normalize input (optional)
    const trimmedValue = value.trim();

    // 2. Check if skill already exists
    const existingSkill = await list_non_tech_skill.findOne({
      name: trimmedValue,
    });

    if (existingSkill) {
      return existingSkill._id;
    }

    // 3. If not found, insert new skill
    const newSkill = await list_non_tech_skill.create({
      name: trimmedValue,
      is_del: 0,
      is_active: 0,
      flag: 1,
    });

    return newSkill._id;
  } catch (error) {
    console.error("DB Error in getOrInsertId →", error.message);
    throw error;
  }
};

/**
 * @description Add a new itskill entry for the authenticated user
 * @route POST /api/candidate/itskill/additskill
 * @param {string} skillSearch.required - The search string for the skill
 * @param {string} version - The software version of the skill
 * @param {string} lastUsed - The last used date of the skill
 * @param {string} experienceyear - The year of experience in the skill
 * @param {string} experiencemonth - The month of experience in the skill
 * @security BearerAuth
 * @returns {object} 201 - itskill added successfully
 * @returns {object} 400 - User ID or Skill Search is required
 * @returns {object} 500 - Error adding itskill
 */
export const additskill = async (req, res) => {
  try {
    const userId = req.userId;
    const { skillSearch, version, lastUsed, experienceyear, experiencemonth } =
      req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    if (!skillSearch) {
      return res.status(400).json({ message: "Skill Search is required" });
    }

    const skillId = await getOrInsertId(skillSearch.toLowerCase());

    const itskill = new Itskill({
      userId,
      skillSearch: skillId,
      version,
      lastUsed,
      experienceyear,
      experiencemonth,
    });

    await itskill.save();

    const userdtl = await User.findById(userId);

    const htmlEmail = `
      <div style="font-family: Arial, sans-serif; color:#333; padding:20px; line-height:1.6; max-width:600px; margin:auto; background:#f9f9f9; border-radius:8px;">
         <div>
    <img src= "${process.env.CLIENT_BASE_URL_TEMP}/images/emailheader/additskill.png"
         alt="GEISIL Banner" 
         style="width:100%; border-radius:8px 8px 0 0; display:block;" />
  </div>
        <div style="background:#0052cc; padding:15px 20px; border-radius:8px 8px 0 0;">
          <h2 style="color:#fff; margin:0; font-size:20px;"> Itskill List Update Notification</h2>
        </div>
    
        <div style="padding:20px; background:#ffffff; border-radius:0 0 8px 8px;">
          <p>Dear <strong>${userdtl.name}</strong>,</p>
              
           <p>New Itskill details have been <strong>added</strong> to your profile.</p>
                
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
      subject: "Itskill List Update Notification",
      html: htmlEmail,
    };
    await transporter.sendMail(mailOptions);

    res
      .status(201)
      .json({ message: "itskill added successfully", success: true });
  } catch (error) {
    console.error("Error adding itskill:", error);
    res
      .status(500)
      .json({ message: "Error adding itskill", error: error.message });
  }
};

/**
 * @description Edit an existing itskill entry for the authenticated user
 * @route PUT /api/candidate/itskill/edititskill
 * @param {string} _id.required - The MongoDB ID of the itskill document
 * @param {string} skillSearch.required - The search string for the skill
 * @param {string} version - The software version of the skill
 * @param {string} lastUsed - The last used date of the skill
 * @param {string} experienceyear - The year of experience in the skill
 * @param {string} experiencemonth - The month of experience in the skill
 * @security BearerAuth
 * @returns {object} 200 - itskill updated successfully
 * @returns {object} 400 - User ID, Skill Search, or itskill ID is required
 * @returns {object} 500 - Error updating itskill
 */
export const edititskill = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      _id,
      skillSearch,
      version,
      lastUsed,
      experienceyear,
      experiencemonth,
    } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    if (!skillSearch) {
      return res.status(400).json({ message: "Skill Search is required" });
    }
    if (!_id) {
      return res.status(400).json({ message: "itskill ID is required" });
    }

    const skillId = await getOrInsertId(skillSearch.toLowerCase());

    const itskill = await Itskill.findOneAndUpdate(
      { _id, userId },
      {
        skillSearch: skillId,
        version,
        lastUsed,
        experienceyear,
        experiencemonth,
      },
      { new: true }
    );

    const userdtl = await User.findById(userId);

    const htmlEmail = `
      <div style="font-family: Arial, sans-serif; color:#333; padding:20px; line-height:1.6; max-width:600px; margin:auto; background:#f9f9f9; border-radius:8px;">
         <div>
    <img src= "${process.env.CLIENT_BASE_URL_TEMP}/images/emailheader/editskill.png"
         alt="GEISIL Banner" 
         style="width:100%; border-radius:8px 8px 0 0; display:block;" />
  </div>
        <div style="background:#0052cc; padding:15px 20px; border-radius:8px 8px 0 0;">
          <h2 style="color:#fff; margin:0; font-size:20px;"> Itskill List Update Notification</h2>
        </div>
    
        <div style="padding:20px; background:#ffffff; border-radius:0 0 8px 8px;">
          <p>Dear <strong>${userdtl.name}</strong>,</p>
              
           <p>One of the Itskill details have been <strong>updated</strong> in your profile.</p>
                
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
      subject: "Itskill List Update Notification",
      html: htmlEmail,
    };
    await transporter.sendMail(mailOptions);

    res
      .status(200)
      .json({ message: "itskill updated successfully", success: true });
  } catch (error) {
    console.error("Error adding itskill:", error);
    res
      .status(500)
      .json({ message: "Error adding itskill", error: error.message });
  }
};

/**
 * @description Retrieve IT skills for the authenticated user.
 * @route GET /api/candidate/itskill/getitskill
 * @access protected
 * @returns {object} 200 - An array of IT skills with details
 * @returns {object} 500 - Error fetching IT skills
 */
export const getitskill = async (req, res) => {
  try {
    const userId = req.userId;
    //where is_del is false
    const itskills = await Itskill.find({ userId, is_del: false });

    // Use Promise.all to wait for all skill names to be fetched
    const formatteditskills = await Promise.all(
      itskills.map(async (itskill) => ({
        _id: itskill._id,
        skillSearch: await giveIDgetname(itskill.skillSearch), // convert ID to name
        version: itskill.version,
        lastUsed: itskill.lastUsed,
        experienceyear: itskill.experienceyear,
        experiencemonth: itskill.experiencemonth,
      }))
    );

    res.status(200).json({ success: true, data: formatteditskills });
  } catch (error) {
    console.error("Error fetching itskills:", error);
    res
      .status(500)
      .json({ message: "Error fetching itskills", error: error.message });
  }
};

/**
 * @description Soft delete an IT skill by marking it as deleted for the authenticated user
 * @route DELETE /api/candidate/itskill/deleteitskill
 * @access protected
 * @param {Object} req - Express request object containing userId and itskill ID in the body
 * @param {Object} res - Express response object
 * @returns {Object} 200 - IT skill deleted successfully
 * @returns {Object} 400 - Missing user ID or itskill ID
 * @returns {Object} 500 - Error deleting itskill
 */
export const deleteitskill = async (req, res) => {
  try {
    const userId = req.userId;
    const { _id } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    if (!_id) {
      return res.status(400).json({ message: "itskill ID is required" });
    }

    //update is_del to false
    const itskill = await Itskill.findOneAndUpdate(
      { _id, userId },
      { is_del: true, updatedAt: Date.now() },
      { new: true }
    );

    const userdtl = await User.findById(userId);

    const htmlEmail = `
      <div style="font-family: Arial, sans-serif; color:#333; padding:20px; line-height:1.6; max-width:600px; margin:auto; background:#f9f9f9; border-radius:8px;">
         <div>
    <img src= "${process.env.CLIENT_BASE_URL_TEMP}/images/emailheader/deleteitskill.png"
         alt="GEISIL Banner" 
         style="width:100%; border-radius:8px 8px 0 0; display:block;" />
  </div>
        <div style="background:#0052cc; padding:15px 20px; border-radius:8px 8px 0 0;">
          <h2 style="color:#fff; margin:0; font-size:20px;"> Itskill List Update Notification</h2>
        </div>
    
        <div style="padding:20px; background:#ffffff; border-radius:0 0 8px 8px;">
          <p>Dear <strong>${userdtl.name}</strong>,</p>
              
           <p>One of your Itskill details have been <strong>deleted</strong> from your profile.</p>
                
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
      subject: "Itskill List Update Notification",
      html: htmlEmail,
    };
    await transporter.sendMail(mailOptions);

    res
      .status(200)
      .json({ message: "itskill deleted successfully", success: true });
  } catch (error) {
    console.error("Error adding itskill:", error);
    res
      .status(500)
      .json({ message: "Error adding itskill", error: error.message });
  }
};

/**
 * @description Add a new Other Skill entry for the authenticated user
 * @route POST /api/candidate/otherskill/addotherskill
 * @param {string} skillSearch.required - The search string for the skill
 * @param {string} version - The software version of the skill
 * @param {string} lastUsed - The last used date of the skill
 * @param {string} experienceyear - The year of experience in the skill
 * @param {string} experiencemonth - The month of experience in the skill
 * @security BearerAuth
 * @returns {object} 201 - Otherskill added successfully
 * @returns {object} 400 - User ID or Skill Search is required
 * @returns {object} 500 - Error adding otherskill
 */
export const addOtherSkill = async (req, res) => {
  try {
    const userId = req.userId;
    const { skillSearch, experienceyear, experiencemonth } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    if (!skillSearch) {
      return res.status(400).json({ message: "Skill Search is required" });
    }

    const skillId = await getOrInsertIdForOtherSkill(skillSearch.toLowerCase());

    const otherskill = new Otherskill({
      userId,
      skillSearch: skillId,
      experienceyear,
      experiencemonth,
    });

    await otherskill.save();

    const userdtl = await User.findById(userId);

    const htmlEmail = `
      <div style="font-family: Arial, sans-serif; color:#333; padding:20px; line-height:1.6; max-width:600px; margin:auto; background:#f9f9f9; border-radius:8px;">
         <div>
    <img src= "${process.env.CLIENT_BASE_URL_TEMP}/images/emailheader/addotherskill.png"
         alt="GEISIL Banner" 
         style="width:100%; border-radius:8px 8px 0 0; display:block;" />
  </div>
        <div style="background:#0052cc; padding:15px 20px; border-radius:8px 8px 0 0;">
          <h2 style="color:#fff; margin:0; font-size:20px;"> Otherskill List Update Notification</h2>
        </div>
    
        <div style="padding:20px; background:#ffffff; border-radius:0 0 8px 8px;">
          <p>Dear <strong>${userdtl.name}</strong>,</p>
              
           <p>New Otherskill details have been <strong>added</strong> to your profile.</p>
                
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
      subject: "Otherskill List Update Notification",
      html: htmlEmail,
    };
    await transporter.sendMail(mailOptions);

    res
      .status(201)
      .json({ message: "Otherskill added successfully", success: true });
  } catch (error) {
    console.error("Error adding otherskill:", error);
    res
      .status(500)
      .json({ message: "Error adding otherskill", error: error.message });
  }
};

/**
 * @description Edit an existing otherskill entry for the authenticated user
 * @route PUT /api/candidate/itskill/editotherskill
 * @param {string} _id.required - The MongoDB ID of the otherskill document
 * @param {string} skillSearch.required - The search string for the skill
 * @param {string} version - The software version of the skill
 * @param {string} lastUsed - The last used date of the skill
 * @param {string} experienceyear - The year of experience in the skill
 * @param {string} experiencemonth - The month of experience in the skill
 * @security BearerAuth
 * @returns {object} 200 - otherskill updated successfully
 * @returns {object} 400 - User ID, Skill Search, or otherskill ID is required
 * @returns {object} 500 - Error updating otherskill
 */
export const editotherskill = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      _id,
      skillSearch,
      version,
      lastUsed,
      experienceyear,
      experiencemonth,
    } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    if (!skillSearch) {
      return res.status(400).json({ message: "Skill Search is required" });
    }
    if (!_id) {
      return res.status(400).json({ message: "otherskill ID is required" });
    }

    const skillId = await getOrInsertIdForOtherSkill(skillSearch.toLowerCase());

    const otherskill = await Otherskill.findOneAndUpdate(
      { _id, userId },
      {
        skillSearch: skillId,
        version,
        lastUsed,
        experienceyear,
        experiencemonth,
      },
      { new: true }
    );
    const userdtl = await User.findById(userId);

    const htmlEmail = `
      <div style="font-family: Arial, sans-serif; color:#333; padding:20px; line-height:1.6; max-width:600px; margin:auto; background:#f9f9f9; border-radius:8px;">
         <div>
    <img src= "${process.env.CLIENT_BASE_URL_TEMP}/images/emailheader/editotherskill.png"
         alt="GEISIL Banner" 
         style="width:100%; border-radius:8px 8px 0 0; display:block;" />
  </div>
        <div style="background:#0052cc; padding:15px 20px; border-radius:8px 8px 0 0;">
          <h2 style="color:#fff; margin:0; font-size:20px;"> Otherskill List Update Notification</h2>
        </div>
    
        <div style="padding:20px; background:#ffffff; border-radius:0 0 8px 8px;">
          <p>Dear <strong>${userdtl.name}</strong>,</p>
              
           <p>One of the Otherskill details have been <strong>updated</strong> in your profile.</p>
                
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
      subject: "Otherskill List Update Notification",
      html: htmlEmail,
    };
    await transporter.sendMail(mailOptions);

    res
      .status(200)
      .json({ message: "otherskill updated successfully", success: true });
  } catch (error) {
    console.error("Error adding otherskill:", error);
    res
      .status(500)
      .json({ message: "Error adding otherskill", error: error.message });
  }
};

/**
 * @description Retrieve Other skills for the authenticated user.
 * @route GET /api/candidate/itskill/getotherskill
 * @access protected
 * @returns {object} 200 - An array of Other skills with details
 * @returns {object} 500 - Error fetching other skills
 */
export const getotherskill = async (req, res) => {
  try {
    const userId = req.userId;
    //where is_del is false
    const otherskills = await Otherskill.find({ userId, is_del: false });

    // Use Promise.all to wait for all skill names to be fetched
    const formattedotherskills = await Promise.all(
      otherskills.map(async (otherskill) => ({
        _id: otherskill._id,
        skillSearch: await giveIDgetnameForOtherSkill(otherskill.skillSearch), // convert ID to name
        version: otherskill.version,
        lastUsed: otherskill.lastUsed,
        experienceyear: otherskill.experienceyear,
        experiencemonth: otherskill.experiencemonth,
      }))
    );

    res.status(200).json({ success: true, data: formattedotherskills });
  } catch (error) {
    console.error("Error fetching otherskills:", error);
    res
      .status(500)
      .json({ message: "Error fetching otherskills", error: error.message });
  }
};

/**
 * @description Soft delete an Other skill by marking it as deleted for the authenticated user
 * @route DELETE /api/candidate/itskill/deleteotherskill
 * @access protected
 * @param {Object} req - Express request object containing userId and otherskill ID in the body
 * @param {Object} res - Express response object
 * @returns {Object} 200 - Other skill deleted successfully
 * @returns {Object} 400 - Missing user ID or otherskill ID
 * @returns {Object} 500 - Error deleting itskill
 */
export const deleteotherskill = async (req, res) => {
  try {
    const userId = req.userId;
    const { _id } = req.body;

    console.log(userId);
    console.log("Request body:", req.body);
    console.log("Here Id is : ", _id);

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    if (!_id) {
      return res.status(400).json({ message: "otherskill ID is required" });
    }

    //update is_del to false
    const otherskill = await Otherskill.findOneAndUpdate(
      { _id, userId },
      { is_del: true, updatedAt: Date.now() },
      { new: true }
    );
    const userdtl = await User.findById(userId);

    const htmlEmail = `
      <div style="font-family: Arial, sans-serif; color:#333; padding:20px; line-height:1.6; max-width:600px; margin:auto; background:#f9f9f9; border-radius:8px;">
         <div>
    <img src= "${process.env.CLIENT_BASE_URL_TEMP}/images/emailheader/deleteotherskill.png"
         alt="GEISIL Banner" 
         style="width:100%; border-radius:8px 8px 0 0; display:block;" />
  </div>
        <div style="background:#0052cc; padding:15px 20px; border-radius:8px 8px 0 0;">
          <h2 style="color:#fff; margin:0; font-size:20px;"> Otherskill List Update Notification</h2>
        </div>
    
        <div style="padding:20px; background:#ffffff; border-radius:0 0 8px 8px;">
          <p>Dear <strong>${userdtl.name}</strong>,</p>
              
           <p>One of your otherskill details have been <strong>deleted</strong> from your profile.</p>
                
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
      subject: "Otherskill List Update Notification",
      html: htmlEmail,
    };
    await transporter.sendMail(mailOptions);

    res
      .status(200)
      .json({ message: "Other skill deleted successfully", success: true });
  } catch (error) {
    console.error("Error adding other skill:", error);
    res
      .status(500)
      .json({ message: "Error adding other skill", error: error.message });
  }
};
