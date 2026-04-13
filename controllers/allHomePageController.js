import homeBannerDetails from "../models/allHomePageModels.js";
import ServiceDetails from "../models/ServiceDetailsModel.js";
import HomepagecontactModel from "../models/HomePageContactModel.js";
import nodemailer from "nodemailer";
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

    // Nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: true, // true if port is 465, false if 587
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email HTML template (conditional)
    const emailTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: #4f46e5; color: white; padding: 16px; text-align: center;">
          <h2 style="margin: 0; font-size: 20px;">📩 New Contact Submission</h2>
        </div>

        <!-- Body -->
        <div style="padding: 20px; background: #fafafa;">
          <p style="font-size: 16px; margin-bottom: 16px; color: #333;">
            You’ve received a new contact form submission. Here are the details:
          </p>

          <table style="width: 100%; border-collapse: collapse; font-size: 15px;">
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; width: 30%;">👤 Name</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">📧 Email</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${email}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">📝 Subject</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${subject}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; vertical-align: top;">💬 Message</td>
              <td style="padding: 10px; border: 1px solid #ddd; white-space: pre-wrap;">${message}</td>
            </tr>
          </table>
        </div>

        <!-- Footer -->
        <div style="background: #f3f4f6; padding: 14px; text-align: center; font-size: 13px; color: #555;">
          <p style="margin: 0;">This email was generated automatically by GEISIL <strong>Contact Form</strong>.</p>
          <p style="margin: 4px 0 0;">&copy; ${new Date().getFullYear()} GEISIL</p>
        </div>
      </div>
      `;

    // Send email
    /* email Checked */
    await transporter.sendMail({
      from: `"GEISIL Team" <${process.env.EMAIL_USER}>`,
      to: "chandrasarkar2sglobal@gmail.com",
      // to: "kp.sunit@gmail.com",
      // cc: ["d.dey1988@gmail.com", "avik@2sglobal.co", "abhishek@2sglobal.us"],
      subject: `📩 New Contact Form Submission: ${subject}`,
      html: emailTemplate,
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
    const {
      banner_title,
    } = req.body;

    if (
      !banner_title
    ) {
      return res.status(400).json({
        success: false,
        message:
          "All fields are required:  banner_title",
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
          }
        );
        stream.end(req.file.buffer);
      });
      updatedImage = uploadResult.secure_url;
    }



    const newTestimonial = new homeBannerDetails({
      banner_title,
      banner_image: updatedImage,
    });

    const savedTestimonial = await newTestimonial.save();
    res.status(201).json({ message: "Banner added successfully", data: savedTestimonial });
  } catch (error) {
    res.status(500).json({ message: "Error adding Banner", error: error.message });
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
    const {
      id,
      banner_title,
    } = req.body;
    // ✅ Validate required fields
    if (
      !id
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Banner id is required",
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
          }
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
        oldPublicId = oldImageUrlParts[oldImageUrlParts.length - 1].split(".")[0];
      }
      // If there was an old image, delete it from Cloudinary
      if (oldPublicId) {
        try {
          await cloudinary.uploader.destroy(`homepageitems/banner/${oldPublicId}`);
        }
        catch (err) {
          console.log("file delete failed")
        }

      }

    }

    // ✅ Build dynamic update object
    const updateData = {};

    if (banner_title) {
      updateData.banner_title = banner_title;
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
    const updated = await homeBannerDetails.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

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

        await cloudinary.uploader.destroy(
          `homepageitems/banner/${publicId}`
        );
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