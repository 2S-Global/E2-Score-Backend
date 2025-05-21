import User from "../../models/userModel.js";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * @route POST /api/useraction/update-profile-picture
 * @summary Upload or update the user's profile picture
 * @description This endpoint uploads a new profile picture for the authenticated user to Cloudinary.
 *              It deletes the old picture if it exists and updates the user's profile with the new URL.
 * @security BearerAuth
 * @param {file} file.formData.required - Profile picture file (image)
 * @returns {object} 200 - Profile picture updated successfully
 * @returns {object} 400 - No file uploaded
 * @returns {object} 404 - User not found
 * @returns {object} 500 - Error adding profile picture
 */
//Add profile picture
export const addProfilePicture = async (req, res) => {
  try {
    const user_id = req.userId;
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const uploadToCloudinary = () => {
      return new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            { folder: "e2score/profile_picture" },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result);
              }
            }
          )
          .end(req.file.buffer);
      });
    };

    const oldProfilePicture = user.profilePicture;
    let oldPublicId = null;

    if (oldProfilePicture) {
      // Extract the public ID from the old image URL
      const oldImageUrlParts = oldProfilePicture.split("/");
      oldPublicId = oldImageUrlParts[oldImageUrlParts.length - 1].split(".")[0];
    }
    // Upload the new file to Cloudinary
    const result = await uploadToCloudinary();
    const profilePictureUrl = result.secure_url;

    // If there was an old image, delete it from Cloudinary
    if (oldPublicId) {
      await cloudinary.uploader.destroy(
        `e2score/profile_picture/${oldPublicId}`
      );
    }

    // Update the user's profile with the new picture URL
    const updatedUser = await User.findByIdAndUpdate(
      user_id,
      { profilePicture: profilePictureUrl },
      { new: true }
    );

    res.status(200).json({
      message: "Profile picture updated successfully",
      profilePicture: profilePictureUrl,
    });
  } catch (error) {
    console.error("Error adding profile picture:", error);
    res.status(500).json({ message: "Error adding profile picture" });
  }
};
