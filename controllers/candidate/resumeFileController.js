import axios from "axios";
import FormData from "form-data";
import ResumeDetails from "../../models/resumeDetailsModels.js";
import CoverLetterModel from "../../models/coverLetterModel.js";

import User from "../../models/userModel.js";
import { emailQueue } from "../../queues/emailQueue.js";

/**
 * Upload a file to an external server using Axios and FormData.
 *
 * @param {Express.Multer.File} file - The file to upload
 * @returns {Promise<string | null>} The file path if successful, or null if not
 */
export const uploadFileToExternalServer = async (file) => {
  const form = new FormData();
  form.append("file", file.buffer, {
    filename: file.originalname,
    contentType: file.mimetype,
  });

  try {
    const response = await axios.post(
      "https://a2zcart.uk/e2score/fileupload/upload.php",
      form,
      { headers: form.getHeaders() },
    );

    return response.data?.file_path;
  } catch (error) {
    console.error("Error during file upload:", error.message);
    if (error.response) {
      console.error("Error response from server:", error.response.data);
    }
    return null;
  }
};

/**
 * @route POST /api/candidate/resumefile/upload-pdf
 * @summary Add or update Resume Details
 * @description This endpoint uploads a new Resume Details for the authenticated user.
 *              It deletes the old Resume Details if it exists and updates the user's Resume Details with the new URL.
 * @security BearerAuth
 * @param {text} file.formData.required - file
 * @returns {object} 200 - PDF uploaded and resume updated successfully!
 * @returns {object} 400 - Resume details not found for this user.
 * @returns {object} 500 - Error uploading PDF.
 */

export const uploadPDF = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No PDF file uploaded." });
    }

    const resumeFile = req.file;
    let resumeFileUrl = null;

    if (resumeFile) {
      resumeFileUrl = await uploadFileToExternalServer(resumeFile);
    }

    const resumeDetails = await ResumeDetails.findOneAndUpdate(
      { user: userId },
      {
        fileName: resumeFile.originalname,
        fileUrl: resumeFileUrl,
        isDel: false,
      },
      { new: true, upsert: true },
    );

    if (!resumeDetails) {
      return res
        .status(404)
        .json({ message: "Resume details not found for this user." });
    }

    const userdtl = await User.findById(userId);
    console.log("wokring hard ==>", userdtl);
    try {
      console.log('new PIN===>', userdtl.email)
      await emailQueue.add("resume_uploaded", {
        to: userdtl.email,
        userdtl: {
          name: userdtl.name,
        },
      });
    } catch (emailError) {
      console.error("Queueing email failed:", emailError);
    }

    return res.status(200).json({
      success: true,
      message: "PDF uploaded and resume updated successfully",
      pdfUrl: resumeDetails,
    });
  } catch (error) {
    console.error("Error uploading PDF:", error);
    res
      .status(500)
      .json({ message: "Error uploading PDF", error: error.message });
  }
};

export const uploadCoverLetter = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No PDF file uploaded." });
    }

    const File = req.file;
    let FileUrl = null;

    if (File) {
      FileUrl = await uploadFileToExternalServer(File);
    }

    const Details = await CoverLetterModel.findOneAndUpdate(
      { user: userId },
      {
        fileName: File.originalname,
        fileUrl: FileUrl,
        isDel: false,
      },
      { new: true, upsert: true },
    );

    if (!Details) {
      return res
        .status(404)
        .json({ message: "Cover letter not found for this user." });
    }


    const userdtl = await User.findById(userId);
    /*  
        const htmlEmail = \`
          <div style="font-family: Arial, sans-serif; color:#333; padding:20px; line-height:1.6; max-width:600px; margin:auto; background:#f9f9f9; border-radius:8px;">
             <div>
        <img src= "\${process.env.CLIENT_BASE_URL_TEMP}/images/emailheader/addresume.png"
             alt="GEISIL Banner" 
             style="width:100%; border-radius:8px 8px 0 0; display:block;" />
      </div>
            <div style="background:#0052cc; padding:15px 20px; border-radius:8px 8px 0 0;">
              <h2 style="color:#fff; margin:0; font-size:20px;"> Resume Update Notification</h2>
            </div>
        
            <div style="padding:20px; background:#ffffff; border-radius:0 0 8px 8px;">
              <p>Dear <strong>\${userdtl.name}</strong>,</p>
                  
               <p>Your resume has been <strong>uploaded</strong> successfully on your profile.</p>
                    
              <p>If you did not make this change, please contact support immediately.</p>
        
              <p>You can access your dashboard using the link below:</p>
        
              <p>
                <a href="\${process.env.ORIGIN}" 
                  style="background:#0052cc; color:#fff; padding:10px 16px; text-decoration:none; border-radius:5px; display:inline-block;">
                  Visit Dashboard
                </a>
              </p>
        
              <p>If the button does not work, use this link:</p>
              <p><a href="\${process.env.ORIGIN}" style="color:#0052cc;">\${process.env.ORIGIN}</a></p>
        
              <br />
        
              <p>Sincerely,<br />
              <strong>Admin Team</strong><br />
              Global Employability Information Services India Limited
              </p>
            </div>
          </div>
          \`;
    */
    await emailQueue.add("resume_update_notification", {
      email: userdtl.email,
      name: userdtl.name
    });

    return res.status(200).json({
      success: true,
      message: "PDF uploaded and cover letter updated successfully",
      pdfUrl: Details,
    });
  } catch (error) {
    console.error("Error uploading PDF:", error);
    res
      .status(500)
      .json({ message: "Error uploading PDF", error: error.message });
  }
};

/**
 * @description Get the Resume Details of the authenticated user
 * @route GET /api/candidate/resumefile/get_resume_details
 * @access protected
 * @returns {object} 200 - Resume details fetched successfully.
 * @returns {object} 400 - User ID is required.
 * @returns {object} 404 - No resume found for this user.
 * @returns {object} 500 - Error fetching resume details
 */

export const getResumeDetails = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    const resumeDetails = await ResumeDetails.findOne({
      user: userId,
      isDel: false,
    });

    if (!resumeDetails) {
      return res
        .status(404)
        .json({ message: "No resume found for this user." });
    }

    return res.status(200).json({
      success: true,
      message: "Resume details fetched successfully.",
      data: resumeDetails,
    });
  } catch (error) {
    console.error("Error fetching resume details:", error);
    res
      .status(500)
      .json({ message: "Error fetching resume details", error: error.message });
  }
};

export const getCoverLetterDetails = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    const details = await CoverLetterModel.findOne({
      user: userId,
      isDel: false,
    });

    if (!details) {
      return res
        .status(404)
        .json({ message: "No Cover letter found for this user." });
    }


    //send background Email
    const userdtl = await User.findById(userId);
    console.log("wokring hard ==>", userdtl);
    try {
      await emailQueue.add("cover_letter_uploaded", {
        to: userdtl.email,
        userdtl: {
          name: userdtl.name,
        },
      });
    } catch (emailError) {
      console.error("Queueing email failed:", emailError);
    }

    return res.status(200).json({
      success: true,
      message: "Cover letter  details fetched successfully.",
      data: details,
    });
  } catch (error) {
    console.error("Error fetching cover letter details:", error);
    res.status(500).json({
      message: "Error fetching cover letter details",
      error: error.message,
    });
  }
};

/**
 * @description Soft delete an Resume Details by user ID.
 * @route DELETE /api/candidate/resumefile/delete_resume_details
 * @access protected
 * @returns {object} 200 - Resume deleted (soft delete) successfully.
 * @returns {object} 400 - User ID is required.
 * @returns {object} 404 - No active resume found to delete.
 * @returns {object} 500 - Error deleting resume
 */

export const deleteResume = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    const deletedResume = await ResumeDetails.findOneAndUpdate(
      { user: userId, isDel: false },
      { isDel: true },
      { new: true },
    );

    if (!deletedResume) {
      return res
        .status(404)
        .json({ message: "No active resume found to delete." });
    }

    const userdtl = await User.findById(userId);

    try {
      await emailQueue.add("resume_deleted", {
        to: userdtl.email,
        userdtl: {
          name: userdtl.name,
        },
      });
    } catch (emailError) {
      console.error("Queueing email failed:", emailError);
    }

    return res.status(200).json({
      success: true,
      message: "Resume deleted (soft delete) successfully.",
      data: deletedResume,
    });
  } catch (error) {
    console.error("Error deleting resume:", error);
    res
      .status(500)
      .json({ message: "Error deleting resume", error: error.message });
  }
};

export const deleteCoverLetter = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    const deletedData = await CoverLetterModel.findOneAndUpdate(
      { user: userId, isDel: false },
      { isDel: true },
      { new: true },
    );
    console.log("wwwwwwwww", deletedData);

    if (!deletedData) {
      return res
        .status(404)
        .json({ message: "No active cover letter found to delete." });
    }

    const userdtl = await User.findById(userId);

    try {
      await emailQueue.add("cover_letter_deleted", {
        to: userdtl.email,
        userdtl: {
          name: userdtl.name,
        },
      });
    } catch (emailError) {
      console.error("Queueing email failed:", emailError);
    }
    //soft delete
    return res.status(200).json({
      success: true,
      message: "Cover letter deleted successfully.",
      data: deletedData,
    });
  } catch (error) {
    console.error("Error deleting resume:", error);
    res
      .status(500)
      .json({ message: "Error deleting resume", error: error.message });
  }
};
