import homeBannerDetails from "../models/allHomePageModels.js";
import ServiceDetails from "../models/ServiceDetailsModel.js";
import HomepagecontactModel from "../models/HomePageContactModel.js";
import jwt from "jsonwebtoken";
import { emailQueue } from "../queues/emailQueue.js";
import { v2 as cloudinary } from "cloudinary";

export const getAllFields = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "Home Page Testing API is running successfully ! ",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching fields",
      error: error.message,
    });
  }
};

export const getAllBannerDetails = async (req, res) => {
  try {
    // Fetch all banners (latest first optional)
    const banners = await homeBannerDetails.find().sort({ createdAt: -1 }); // optional: latest first

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
    const services = await ServiceDetails.find({ isDel: false }).sort({
      createdAt: -1,
    }); // latest first

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
      { new: true },
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

export const addContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    console.log("I am inside addContact controller");
    console.log("Received contact data:", req.body);

    // Basic validation
    if (!name || !email || !subject || !message) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // Save to DB
    const contact = new HomepagecontactModel({
      name,
      email,
      subject,
      message,
      isDel: false,
    });

    await contact.save();

    // Send email via queue
    await emailQueue.add("home_page_contact", {
      name,
      email,
      subject,
      message,
    });

    // Response
    res.status(201).json({
      success: true,
      message: "Contact submitted and email sent successfully",
      data: contact,
    });
  } catch (error) {
    console.error("Error adding contact:", error);
    res.status(500).json({
      success: false,
      message: "Server error, please try again later",
    });
  }
};

export const listContact = async (req, res) => {
  try {
    console.log("I am inside listContact controller");

    const contacts = await HomepagecontactModel.find({
      isDel: false,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Contact list fetched successfully",
      data: contacts,
    });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({
      success: false,
      message: "Server error, please try again later",
    });
  }
};

export const addBanner = async (req, res) => {
  try {
    const { banner_title, description } = req.body;

    if (!banner_title) {
      return res.status(400).json({
        success: false,
        message: "All fields are required:  banner_title",
      });
    }
    let updatedImage = null;
    // ✅ If new image is uploaded → replace it
    if (req.file) {
      if (!req.file.buffer) {
        return res.status(400).json({
          success: false,
          message: "Invalid image file",
        });
      }
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
          },
        );
        stream.end(req.file.buffer);
      });
      updatedImage = uploadResult.secure_url;
    }

    const newTestimonial = new homeBannerDetails({
      banner_title,
      banner_image: updatedImage,
      description,
    });

    const savedTestimonial = await newTestimonial.save();
    res
      .status(201)
      .json({ message: "Banner added successfully", data: savedTestimonial });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding Banner", error: error.message });
  }
};

export const getAllBannners = async (req, res) => {
  try {
    const banners = await homeBannerDetails.find({ is_del: false });
    res.status(200).json({
      message: "Banners fetched successfully",
      data: banners,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching banners",
      error: error.message,
    });
  }
};

export const updateBanner = async (req, res) => {
  try {
    const { id, banner_title, description } = req.body;
    // ✅ Validate required fields
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Banner id is required",
      });
    }

    // ✅ Fetch the existing Banner
    const existingBanner = await homeBannerDetails.findById(id);
    if (!existingBanner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    let updatedImage = existingBanner.banner_image;
    // ✅ If new image is uploaded → replace it
    if (req.file) {
      if (!req.file.buffer) {
        return res.status(400).json({
          success: false,
          message: "Invalid image file",
        });
      }
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
          },
        );
        stream.end(req.file.buffer);
      });

      updatedImage = uploadResult.secure_url;
      //   🔥 (Optional but recommended)
      //   Delete old image from Cloudinary
      const oldImage = existingBanner.banner_image;
      let oldPublicId = null;
      if (oldImage) {
        // Extract the public ID from the old image URL
        const oldImageUrlParts = oldImage.split("/");
        oldPublicId =
          oldImageUrlParts[oldImageUrlParts.length - 1].split(".")[0];
      }
      // If there was an old image, delete it from Cloudinary
      if (oldPublicId) {
        try {
          await cloudinary.uploader.destroy(
            `homepageitems/banner/${oldPublicId}`,
          );
        } catch (err) {
          console.log("file delete failed");
        }
      }
    }

    // ✅ Build dynamic update object
    const updateData = {};

    if (banner_title) {
      updateData.banner_title = banner_title;
    }

    if (description) {
      updateData.description = description;
    }

    if (updatedImage) {
      updateData.banner_image = updatedImage;
    }

    // ❌ If nothing to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No data provided to update",
      });
    }

    // ✅ Update the Testimonial with the new data (replace verifications)
    const updated = await homeBannerDetails.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    res.status(200).json({
      success: true,
      message: "Banner updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Update Banner Error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating Banner",
      error: error.message,
    });
  }
};

export const deleteBanner = async (req, res) => {
  try {
    const { id } = req.body;

    console.log("Delete Banner ID:", id);

    // ✅ Validate
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Banner id is required",
      });
    }

    // ✅ Find banner
    const banner = await homeBannerDetails.findById(id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    // 🔥 Delete image from Cloudinary (optional but recommended)
    if (banner.banner_image) {
      try {
        const parts = banner.banner_image.split("/");
        const fileName = parts[parts.length - 1];
        const publicId = fileName.split(".")[0];

        await cloudinary.uploader.destroy(`homepageitems/banner/${publicId}`);
      } catch (err) {
        console.log("Cloudinary delete failed");
      }
    }

    // ✅ Delete from DB
    await homeBannerDetails.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Banner deleted successfully",
    });
  } catch (error) {
    console.error("Delete Banner Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting Banner",
      error: error.message,
    });
  }
};
