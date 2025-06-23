import User from "../../models/userModel.js";
import { v2 as cloudinary } from "cloudinary";
import PersonalDetails from "../../models/personalDetails.js";
import CandidateDetails from "../../models/CandidateDetailsModel.js";
import db_sql from "../../config/sqldb.js";
import UserEducation from "../../models/userEducationModel.js";
import axios from "axios";
import FormData from "form-data";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


//  /api/candidate/resumefile/add_resume
export const addResume = async (req, res) => {
  try {
    // const { socialProfile, url, description } = req.body;
    // const userId = req.userId;

    // if (!userId || !socialProfile || !url) {
    //   return res.status(400).json({
    //     message: "Required fields: socialProfile and url.",
    //   });
    // }

    // const newProfile = new OnlineProfile({
    //   userId,
    //   socialProfile,
    //   url,
    //   description,
    // });

    // await newProfile.save();

    res.status(201).json({
      success: true,
      message: "Resume inserted successfully!",
      data: newProfile,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error inserting Resume",
      error: error.message,
    });
  }
};





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



// /api/candidate/resumefile/add_resume/upload-pdf
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

    // Upload transcript file if available
    if (resumeFile) {
      resumeFileUrl = await uploadFileToExternalServer(resumeFile);
    }

    // resumeFileName
    // Update existing personalDetails document
    const updatedPersonalDetails = await PersonalDetails.findOneAndUpdate(
      { user: userId },                     
      { resumeFileName: resumeFileUrl },   
      { new: true }                      
    );


    if (!updatedPersonalDetails) {
      return res.status(404).json({ message: "Personal details not found for this user." });
    }


    return res.status(200).json({
      success: true,
      message: "PDF uploaded and resume updated successfully",
      pdfUrl: resumeFileUrl
    });

  } catch (error) {
    console.error("Error uploading PDF:", error);
    res.status(500).json({ message: "Error uploading PDF", error: error.message });
  }
};