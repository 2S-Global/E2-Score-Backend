import AboutPageModel from "../../models/AboutPageModel.js"; 
import { v2 as cloudinary } from 'cloudinary';
/**
 * @description It allows to update page
 * @route Post /api/about/updateAbout
 * @success {object} 200 - after a successful update return the updated data
 * @error {object} 500 - Error Occured in Database query failed
 */
export const updateData = async (req, res) => {
  try {
    const {
      id,
      title,
      description,
    } = req.body;

    // ✅ Validate required fields
    if (
      !id||
      !title ||
      !description 
    ) {
      return res.status(400).json({
        success: false,
        message:
          "All fields are required: id, title, description",
      });
    }
 
    // ✅ Fetch the existing About
    const existingAbout = await AboutPageModel.findById(id);
    if (!existingAbout) {
      return res.status(404).json({
        success: false,
        message: "About page not found",
      });
    }
      let updatedImage = existingAbout.image;
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
                      { folder: "homepageitems/about" },
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
              const oldImage = existingAbout.image;
              let oldPublicId = null;
              if (oldImage) {
                // Extract the public ID from the old image URL
                const oldImageUrlParts = oldImage.split("/");
                oldPublicId = oldImageUrlParts[oldImageUrlParts.length - 1].split(".")[0];
              }
              // If there was an old image, delete it from Cloudinary
              if (oldPublicId) {
                try{
                      await cloudinary.uploader.destroy(`homepageitems/about/${oldPublicId}`);
                }
                catch(err){
                  console.log("file delete failed")
                }
                
              }

        }

    // ✅ Update data
    const updated = await AboutPageModel.findByIdAndUpdate(
      id,
      {
        title,
        description,
        image:updatedImage
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "About page updated successfully",
      data: updated,
    });
  } 

  catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating about page",
      error: error.message,
    });
  }
}

/**
 * @description return the list of all active packages
 * @route GET /api/about/details
 * @success {object} 200 - this gives us all the list 
 * @error {object} 500 - Error Occured in Database query failed
 */

export const getData = async (req, res) => {
  try {
    const getData = await AboutPageModel.find({},{ title: 1, description: 1, _id: 1,image:1 })
    res.status(200).json({
      message: "About Page fetched successfully",
      data: getData,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching About Page",
      error: error.message,
    });
  }
};
  


