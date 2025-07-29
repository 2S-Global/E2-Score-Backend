import { Readable } from "stream";
import cloudinary from "../config/cloudinary.js";

const uploadToCloudinary = (buffer, folder = "uploads", publicId = null) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId || undefined,
        resource_type: "auto", // handles images, videos, etc.
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    // Convert buffer to readable stream and pipe to cloudinary stream
    const readable = new Readable();
    readable._read = () => {};
    readable.push(buffer);
    readable.push(null);
    readable.pipe(stream);
  });
};

export default uploadToCloudinary;
