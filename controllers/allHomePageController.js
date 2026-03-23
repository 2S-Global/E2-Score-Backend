import homeBannerDetails from "../models/allHomePageModels.js";
import { v2 as cloudinary } from 'cloudinary';

export const getAllFields = async (req, res) => {
    try {

        res.status(200).json({
            success: true,
            message: "Home Page Testing API is running successfully ! ",
        });

    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching fields", error: error.message });
    }
};

export const addBannerDetails = async (req, res) => {
    try {

        const { title } = req.body;

        console.log("Body:", req.body);
        console.log("File:", req.file);

        // ✅ Validation
        if (!title || !req.file) {
            return res.status(400).json({
                success: false,
                message: "Title and Banner Image are required",
            });
        }

        if (!req.file.buffer) {
            return res.status(400).json({
                success: false,
                message: "Invalid image file",
            });
        }

        console.log("Uploading file:", req.file.originalname);

        // ✅ Upload single image to Cloudinary
        const uploadResult = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { folder: "homepageitems/banner" },
                (error, result) => {
                    if (error) {
                        console.error("Cloudinary upload error:", error);
                        reject(error);
                    } else {
                        resolve(result);
                    }
                }
            );

            stream.end(req.file.buffer);
        });

        // ✅ Save to DB
        const newItem = new homeBannerDetails({
            title,
            bannerImage: uploadResult.secure_url, // 👈 single image
        });

        await newItem.save();

        res.status(200).json({  
            success: true,
            message: "Banner details added successfully ! ",
        });

    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching fields", error: error.message });
    }
};

export const updateBannerDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    console.log("Params:", req.params);
    console.log("Body:", req.body);
    console.log("File:", req.file);

    // ✅ Find existing record
    const existingBanner = await homeBannerDetails.findById(id);

    if (!existingBanner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    let updatedImage = existingBanner.bannerImage;

    // ✅ If new image is uploaded → replace it
    if (req.file) {
      if (!req.file.buffer) {
        return res.status(400).json({
          success: false,
          message: "Invalid image file",
        });
      }

      console.log("Uploading new banner:", req.file.originalname);

      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "homepageitems/banner" },
          (error, result) => {
            if (error) {
              console.error("Cloudinary upload error:", error);
              reject(error);
            } else {
              resolve(result);
            }
          }
        );

        stream.end(req.file.buffer);
      });

      updatedImage = uploadResult.secure_url;

    //   🔥 (Optional but recommended)
    //   Delete old image from Cloudinary
    //   const publicId = extractPublicId(existingBanner.bannerImage);
    //   await cloudinary.uploader.destroy(publicId);
    }

    // ✅ Update DB
    const updatedBanner = await homeBannerDetails.findByIdAndUpdate(
      id,
      {
        title: title || existingBanner.title,
        bannerImage: updatedImage,
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Banner updated successfully",
      data: updatedBanner,
    });

  } catch (error) {
    console.error("Update Banner Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const getAllBannerDetails = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("Params:", req.params);

    // ✅ Validate ID format (important)
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Banner ID is required",
      });
    }

    const banner = await homeBannerDetails.findById(id);

    // ✅ If not found
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: banner,
    });

  } catch (error) {
    console.error("Get Banner By ID Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};