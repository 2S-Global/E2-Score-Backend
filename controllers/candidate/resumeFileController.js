import axios from "axios";
import FormData from "form-data";
import ResumeDetails from "../../models/resumeDetailsModels.js";


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
      { headers: form.getHeaders() }
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
        isDel: false
      },
      { new: true, upsert: true }
    );
 
    if (!resumeDetails) {
      return res.status(404).json({ message: "Resume details not found for this user." });
    }
 
    return res.status(200).json({
      success: true,
      message: "PDF uploaded and resume updated successfully",
      pdfUrl: resumeDetails
    });
 
  } catch (error) {
    console.error("Error uploading PDF:", error);
    res.status(500).json({ message: "Error uploading PDF", error: error.message });
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

    const resumeDetails = await ResumeDetails.findOne({ user: userId, isDel: false });

    if (!resumeDetails) {
      return res.status(404).json({ message: "No resume found for this user." });
    }

    return res.status(200).json({
      success: true,
      message: "Resume details fetched successfully.",
      data: resumeDetails
    });

  } catch (error) {
    console.error("Error fetching resume details:", error);
    res.status(500).json({ message: "Error fetching resume details", error: error.message });
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
      { new: true }
    );

    if (!deletedResume) {
      return res.status(404).json({ message: "No active resume found to delete." });
    }

    return res.status(200).json({
      success: true,
      message: "Resume deleted (soft delete) successfully.",
      data: deletedResume
    });

  } catch (error) {
    console.error("Error deleting resume:", error);
    res.status(500).json({ message: "Error deleting resume", error: error.message });
  }
};