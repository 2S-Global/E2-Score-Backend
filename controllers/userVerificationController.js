import UserCartVerification from "../models/userVerificationCartModel.js";
import UserVerification from "../models/userVerificationModel.js";
import mongoose from "mongoose";
// Register a new user
export const listUserVerifiedList = async (req, res) => {
    try {
        // Extract query parameters
        const { candidate_name } = req.query;
        const employer_id = req.userId;
        if (!user_id) {
          return res.status(400).json({ message: "Employer ID is required" });
      }
        // Check if employer_id is valid
        if (!mongoose.Types.ObjectId.isValid(employer_id)) {
            return res.status(400).json({ message: "Invalid Employer ID" });
        }

        // Create a search condition
        let filter = { employer_id: employer_id };
        if (keyword) {
            filter.$or = [
                { candidate_name: { $regex: candidate_name, $options: "i" } }, 
               
            ];
        }

        // Query MongoDB with filters
        const users = await UserCartVerification.find(filter).limit(50); // Limit results for performance

        if (users.length === 0) {
            return res.status(404).json({ message: "No verified users found" });
        }

        res.status(200).json(users);
        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching verified users:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const verifyPAN = async (req, res) => {
    try {
      const { customer_pan_number, pan_name,id } = req.body;
      const employer_id = req.userId;
  
      if (!customer_pan_number || !pan_name) {
        return res.status(400).json({ message: "PAN number and name are required" });
      }
  
      const panData = {
        mode: "sync",
        data: {
          customer_pan_number,
          pan_name,
          consent: "Y",
          consent_text:
            "I hereby declare my consent agreement for fetching my information via ZOOP API",
        },
        task_id: "8bbb54f3-d299-4535-b00e-e74d2d5a3997",
      };
  
      // Sending request to Zoop API
      const response = await axios.post(
        "https://test.zoop.one/api/v1/in/identity/pan/lite",
        panData,
        {
          headers: {
            "app-id": "67b8252871c07100283cedc6",
            "api-key": "52HD084-W614E0Q-JQY5KJG-R8EW1TW",
            "Content-Type": "application/json",
          },
        }
      );
      const panApiResponse = response.data;
  
  
        const updatedUser = await UserVerification.findByIdAndUpdate(
          id,
          {
            $set: {
              pan_response: panApiResponse,
         
            }
          },
          { new: true } 
        );
        
      res.status(200).json(response.data);
    } catch (error) {
      res.status(200).json({
        message: "PAN verification failed",
        error: error.response ? error.response.data : error.message,
      });
    }
  };


  


  

