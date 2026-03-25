import homeBannerDetails from "../models/allHomePageModels.js";
import ServiceDetails from "../models/ServiceDetailsModel.js";
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
    // Fetch all banners (latest first optional)
    const banners = await homeBannerDetails
      .find()
      .sort({ createdAt: -1 }); // optional: latest first

    // If no banners found
    if (!banners || banners.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No banners found",
      });
    }

    return res.status(200).json({
      success: true,
      data: banners,
    });

  } catch (error) {
    console.error("Get All Banners Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const addServiceDetails = async (req, res) => {
  try {
    const { title, description } = req.body;

    // 🔹 Basic validation
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required",
      });
    }

    // 🔹 Create new service
    const newService = new ServiceDetails({
      title,
      description,
    });

    // 🔹 Save to DB
    await newService.save();

    // 🔹 Response
    return res.status(201).json({
      success: true,
      message: "Service details added successfully",
      data: newService,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error adding service details",
      error: error.message,
    });
  }
};

export const updateServiceDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    // 🔹 Validate ID
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Service ID is required",
      });
    }

    // 🔹 Check if service exists and not deleted
    const existingService = await ServiceDetails.findOne({
      _id: id,
      isDel: false,
    });

    if (!existingService) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    // 🔹 Update fields (only if provided)
    if (title) existingService.title = title;
    if (description) existingService.description = description;

    // 🔹 Save updated data
    await existingService.save();

    return res.status(200).json({
      success: true,
      message: "Service details updated successfully",
      data: existingService,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error updating service details",
      error: error.message,
    });
  }
};

export const getAllServiceDetails = async (req, res) => {
  try {
    // 🔹 Fetch all non-deleted services
    const services = await ServiceDetails.find({ isDel: false })
      .sort({ createdAt: -1 }); // latest first

    return res.status(200).json({
      success: true,
      message: "Service details fetched successfully",
      data: services,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching service details",
      error: error.message,
    });
  }
};

export const deleteServiceDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // 🔹 Validate ID
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Service ID is required",
      });
    }

    // 🔹 Find and update (soft delete)
    const deletedService = await ServiceDetails.findOneAndUpdate(
      { _id: id, isDel: false },
      { isDel: true },
      { new: true }
    );

    // 🔹 If not found
    if (!deletedService) {
      return res.status(404).json({
        success: false,
        message: "Service not found or already deleted",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Service deleted successfully",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error deleting service",
      error: error.message,
    });
  }
};