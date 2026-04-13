import Testimonial from "../../models/TestimonialModel.js"; 
import { v2 as cloudinary } from "cloudinary";
/**
 * @description Create the new testimonials and add to database
 * @route GET /api/testimonials/add-testimonial
 * @success {object} 201 - Saved Testimonial SUccessfully aling with the details
 * @error {object} 500 - Error Occured in Database query failed
 */
 
export const addTestimonial = async (req, res) => {
  try {
    const {
      subject,
      customer_name,
      customer_designation,
      description,
      linkedin_url,
    } = req.body;
 // ✅ Validate required fields
   if (
       !subject ||
      !customer_name ||
      !customer_designation ||
      !description ||
      !linkedin_url
    ) {
      return res.status(400).json({
        success: false,
        message:
          "All fields are required:  subject, customer_name, customer_designation, description, linkedin_url",
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
                  { folder: "homepageitems/testimonial" },
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



    const newTestimonial = new Testimonial({
      subject,
      customer_name,
      customer_designation,
      customer_image:updatedImage,
      description,
      linkedin_url
    });

    const savedTestimonial = await newTestimonial.save();
    res.status(201).json({ message: "Testimonial added successfully", data: savedTestimonial });
  } catch (error) {
    res.status(500).json({ message: "Error adding Testimonial", error: error.message });
  }
};


/**
 * @description return the list of all active testimonials
 * @route GET /api/testimonials/all-testimonial
 * @success {object} 200 - this gives us all the list of active testimonials
 * @error {object} 500 - Error Occured in Database query failed
 */

export const getAllTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ is_del: false });
    res.status(200).json({
      message: "Testimonials fetched successfully",
      data: testimonials,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching testimonials",
      error: error.message,
    });
  }
};


/**
 * @description Delete any perticular Testimonial
 * @route Post /api/testimonials/delete-testimonial
 * @success {object} 200 - after a successful return of delete
 * @error {object} 500 - Error Occured in Database query failed
 */
export const deleteTestimonial = async (req, res) => {
  try {
  const { id } = req.body; 

    const deleted = await Testimonial.findByIdAndUpdate(
      id,
      { is_del: true },
      { new: true }
    );

    if (!deleted) {
      return res.status(404).json({ message: "Testimonial not found" });
    }

  res.status(200).json({
      success: true,
      message: "Testimonial deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Error deleting Testimonial", error: error.message });
  }
};

/**
 * @description It allows to update any perticular Testimonial
 * @route POST /api/testimonials/update-testimonial
 * @success {object} 200 - after a successful update return the updated data
 * @error {object} 500 - Error Occured in Database query failed
 */
export const updateTestimonial = async (req, res) => {
  try {
 const {
      id,
      subject,
      customer_name,
      customer_designation,
      description,
      linkedin_url,
    } = req.body;
 // ✅ Validate required fields
   if (
       !id ||
       !subject ||
      !customer_name ||
      !customer_designation ||
      !description ||
      !linkedin_url
    ) {
      return res.status(400).json({
        success: false,
        message:
          "All fields are required:  id,subject, customer_name, customer_designation, description, linkedin_url",
      });
    }

    // ✅ Fetch the existing Testimonial
    const existingTestimonial = await Testimonial.findById(id);
    if (!existingTestimonial) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found",
      });
    }

    let updatedImage = existingTestimonial.customer_image;
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
                  { folder: "homepageitems/testimonial" },
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
          const oldImage = existingTestimonial.image;
          let oldPublicId = null;
          if (oldImage) {
            // Extract the public ID from the old image URL
            const oldImageUrlParts = oldImage.split("/");
            oldPublicId = oldImageUrlParts[oldImageUrlParts.length - 1].split(".")[0];
          }
          // If there was an old image, delete it from Cloudinary
          if (oldPublicId) {
            try{
                  await cloudinary.uploader.destroy(`homepageitems/testimonial/${oldPublicId}`);
            }
            catch(err){
              console.log("file delete failed")
            }
            
          }

      }

    // ✅ Update the Testimonial with the new data (replace verifications)
    const updated = await Testimonial.findByIdAndUpdate(
      id,
      {
        subject,
        customer_name,
        customer_designation,
        customer_image:updatedImage,
        description,
        linkedin_url
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Testimonial updated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating Testimonial",
      error: error.message,
    });
  }
};





