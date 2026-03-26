import Client from "../../models/ClientModel.js"; 
import { v2 as cloudinary } from "cloudinary";
/**
 * @description Create the new clients and add to database
 * @route GET /api/clients/add-client
 * @success {object} 201 - Saved Client SUccessfully aling with the details
 * @error {object} 500 - Error Occured in Database query failed
 */
 
export const addClient = async (req, res) => {
  try {
    const {
      url,
    } = req.body;
 // ✅ Validate required fields
   if (
       !url 
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Url fields are required",
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
                  { folder: "homepageitems/client" },
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



    const newClient = new Client({
      url,
      image:updatedImage,
    });

    const savedClient = await newClient.save();
    res.status(201).json({ message: "Client added successfully", data: savedClient });
  } catch (error) {
    res.status(500).json({ message: "Error adding Client", error: error.message });
  }
};


/**
 * @description return the list of all active clients
 * @route GET /api/clients/all-client
 * @success {object} 200 - this gives us all the list of active clients
 * @error {object} 500 - Error Occured in Database query failed
 */

export const getAllClients = async (req, res) => {
  try {
    const clients = await Client.find({ is_del: false });
    res.status(200).json({
      message: "Clients fetched successfully",
      data: clients,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching clients",
      error: error.message,
    });
  }
};


/**
 * @description Delete any perticular Client
 * @route Post /api/clients/delete-client
 * @success {object} 200 - after a successful return of delete
 * @error {object} 500 - Error Occured in Database query failed
 */
export const deleteClient = async (req, res) => {
  try {
  const { id } = req.body; 

    const deleted = await Client.findByIdAndUpdate(
      id,
      { is_del: true },
      { new: true }
    );

    if (!deleted) {
      return res.status(404).json({ message: "Client not found" });
    }

  res.status(200).json({
      success: true,
      message: "Client deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Error deleting Client", error: error.message });
  }
};

/**
 * @description It allows to update any perticular Client
 * @route POST /api/clients/update-client
 * @success {object} 200 - after a successful update return the updated data
 * @error {object} 500 - Error Occured in Database query failed
 */
export const updateClient = async (req, res) => {
  try {
 const {
      id,
     url
    } = req.body;
 // ✅ Validate required fields
   if (
       !id ||
       !url 
    ) {
      return res.status(400).json({
        success: false,
        message:
          "All fields are required:  id,url",
      });
    }

    // ✅ Fetch the existing Client
    const existingClient = await Client.findById(id);
    if (!existingClient) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    let updatedImage = existingClient.image;
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
                  { folder: "homepageitems/client" },
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
          const oldImage = existingClient.image;
          let oldPublicId = null;
          if (oldImage) {
            // Extract the public ID from the old image URL
            const oldImageUrlParts = oldImage.split("/");
            oldPublicId = oldImageUrlParts[oldImageUrlParts.length - 1].split(".")[0];
          }
          // If there was an old image, delete it from Cloudinary
          if (oldPublicId) {
            try{
                  await cloudinary.uploader.destroy(`homepageitems/client/${oldPublicId}`);
            }
            catch(err){
              console.log("file delete failed")
            }
            
          }

      }

    // ✅ Update the Client with the new data (replace verifications)
    const updated = await Client.findByIdAndUpdate(
      id,
      {
        url,
        image:updatedImage,
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Client updated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating Client",
      error: error.message,
    });
  }
};





