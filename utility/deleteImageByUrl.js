import cloudinary from "../config/cloudinary.js";

const deleteImageByUrl = async (imageUrl) => {
  try {
    const url = new URL(imageUrl);
    const pathnameParts = url.pathname.split("/").filter(Boolean); // removes empty parts

    // Find the index of 'upload'
    const uploadIndex = pathnameParts.indexOf("upload");

    // publicId parts start after 'upload' and skip the next version part (like v1234567890)
    const publicIdParts = pathnameParts.slice(uploadIndex + 2); // skip 'upload' and 'vXXXX'

    // Remove file extension
    const lastPart = publicIdParts.pop();
    const fileNameWithoutExt = lastPart.split(".")[0];

    // Rebuild public_id
    const publicId = [...publicIdParts, fileNameWithoutExt].join("/");

    /*  console.log("Deleting from Cloudinary public_id:", publicId); */

    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Cloudinary deletion error:", error);
    throw error;
  }
};

export default deleteImageByUrl;
