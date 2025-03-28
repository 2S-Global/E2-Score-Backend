import UserCartVerification from "../models/userVerificationCartModel.js";
import UserVerification from "../models/userVerificationModel.js";
import mongoose from "mongoose";
import axios from "axios";
// Register a new user
export const listUserVerifiedList = async (req, res) => {
  try {
      const employer_id = req.userId;

      if (!employer_id) {
          return res.status(400).json({ message: "Employer ID is required" });
      }

      if (!mongoose.Types.ObjectId.isValid(employer_id)) {
          return res.status(400).json({ message: "Invalid Employer ID" });
      }

      // Fetch all records for the employer_id
      const users = await UserVerification.find({ employer_id });

      if (users.length === 0) {
          return res.status(404).json({ message: "No verified users found" });
      }

      res.status(200).json(users);
  } catch (error) {
      console.error("Error fetching verified users:", error);
      res.status(500).json({ message: "Internal Server Error" });
  }
};
export const verifyPAN = async (req, res) => {
    try {
      const { customer_pan_number, pan_holder_name,id } = req.body;
      const employer_id = req.userId;
      if (!employer_id) {
        return res.status(400).json({ message: "Employer ID is required" });
    }
      if (!customer_pan_number || !pan_holder_name) {
        return res.status(400).json({ message: "PAN number and name are required" });
      }
  
      const panData = {
        mode: "sync",
        data: {
          customer_pan_number,
          pan_holder_name,
          consent: "Y",
          consent_text:
            "I hereby declare my consent agreement for fetching my information via ZOOP API",
        },
        task_id: "8bbb54f3-d299-4535-b00e-e74d2d5a3997",
      };
  
    
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
  
  
        const updatedUser = await UserCartVerification.findByIdAndUpdate(
          id,
          {
            $set: {
              pan_response: panApiResponse,
         
            }
          },
          { new: true } 
        );
        
      res.status(200).json(response.data);
      // res.status(200);
    } catch (error) {
      res.status(200).json({
        message: "PAN verification failed",
        error: error.response ? error.response.data : error.message,
      });
    }
  };


 export const verifyEPIC = async (req, res) => {
    try {

      
      const { customer_epic_number, name_to_match,id } = req.body;

      const employer_id = req.userId;
      if (!employer_id) {
        return res.status(400).json({ message: "Employer ID is required" });
    }
  
      if (!customer_epic_number || !name_to_match) {
        return res.status(400).json({ message: "EPIC number and name are required" });
      }
  
      const epicData = {
        data: {
          customer_epic_number,
          name_to_match,
          consent: "Y",
          consent_text:
            "I hereby declare my consent agreement for fetching my information via ZOOP API",
        },
        task_id: "d15a2a3b-9989-46ef-9b63-e24728292dc0",
      };
  

      const response = await axios.post(
        "https://test.zoop.one/api/v1/in/identity/voter/advance",
        epicData,
        {
          headers: {
            "app-id": "67b8252871c07100283cedc6",
            "api-key": "52HD084-W614E0Q-JQY5KJG-R8EW1TW",
            "Content-Type": "application/json",
          },
        }
      );
  
      const epicApiResponse = response.data;
  
      const updatedUser = await UserCartVerification.findByIdAndUpdate(
        id,
        {
          $set: {
            epic_response: epicApiResponse,
 
          }
        },
        { new: true } 
      );
  
      res.status(200).json(response.data);
          // res.status(200);
    } catch (error) {
      res.status(500).json({
        message: "EPIC verification failed",
        error: error.response ? error.response.data : error.message,
      });
    }
  };

  

 export const verifyAadhaar = async (req, res) => {
    try {
      const { customer_aadhaar_number,id } = req.body;
  
      if (!customer_aadhaar_number) {
        return res.status(400).json({ message: "Aadhaar number is required" });
      }

      const employer_id = req.userId;
      if (!employer_id) {
        return res.status(400).json({ message: "Employer ID is required" });
    }
  
      const aadhaarData = {
        mode: "sync",
        data: {
          customer_aadhaar_number,
          consent: "Y",
          consent_text:
            "I hereby declare my consent agreement for fetching my information via ZOOP API"
        },
        task_id: "ecc326d9-d676-4b10-a82b-50b4b9dd8a16"
      };
  
 
      const response = await axios.post(
        "https://test.zoop.one/api/v1/in/identity/aadhaar/verification",
        aadhaarData,
        {
          headers: {
            "app-id": "67b8252871c07100283cedc6",
            "api-key": "52HD084-W614E0Q-JQY5KJG-R8EW1TW",
            "Content-Type": "application/json"
          },
          timeout: 10000, // 10 seconds timeout
          maxRedirects: 10
        }
      );
  
      const aadhaarApiResponse = response.data;
  
      const updatedUser = await UserVerification.findByIdAndUpdate(
        id,
        {
          $set: {
            aadhaar_response: aadhaarApiResponse,

          }
        },
        { new: true } 
      );
      // res.status(200);
      res.status(200).json(response.data);
    } catch (error) {
      res.status(500).json({
        message: "Aadhaar verification failed",
        error: error.response ? error.response.data : error.message
      });
    }
  };

  export const cloneAndMoveRecordById = async (req, res) => {
    try {
        const { id } = req.body;

        const employer_id = req.userId;
        if (!employer_id) {
          return res.status(400).json({ message: "Employer ID is required" });
      }

        const record = await UserCartVerification.findById(id);
        if (!record) {
            return res.status(404).json({ message: "Record not found" });
        }

        const { _id, ...recordData } = record.toObject();

        const newRecord = await UserVerification.create(recordData);

        await UserCartVerification.findByIdAndDelete(id);

        res.status(200).json({
            message: "Record successfully moved!",
            newRecord,
        });

    } catch (error) {
        res.status(500).json({ message: "Error moving record", error: error.message });
    }
};


export const searchUserVerifiedList = async (req, res) => {
  try {
    const { keyword } = req.body;
    const employer_id = req.userId;

    if (!employer_id) {
      return res.status(400).json({ message: "Employer ID is required" });
    }
    if (!mongoose.Types.ObjectId.isValid(employer_id)) {
      return res.status(400).json({ message: "Invalid Employer ID" });
    }

    // Check if a keyword is provided
    if (!keyword) {
      return res.status(400).json({ message: "Search keyword is required" });
    }

    // Build dynamic search condition
    let filter = { employer_id, $or: [] };

    filter.$or.push(
      { candidate_name: { $regex: keyword, $options: "i" } },
      { candidate_email: { $regex: keyword, $options: "i" } },
      { candidate_mobile: { $regex: keyword, $options: "i" } }
    );

    // Fetch users with filters
    const users = await UserCartVerification.find(filter)
      .select("candidate_name candidate_email candidate_mobile employer_id");

    // Check if users were found
    if (users.length === 0) {
      return res.status(200).json({ message: "No verified users found", users: [] });
    }

    // Return users if found
    res.status(200).json({ users });

  } catch (error) {
    console.error("Error fetching verified users:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const verifyPassport = async (req, res) => {
  try {

    const employer_id = req.userId;
    if (!employer_id) {
      return res.status(400).json({ message: "Employer ID is required" });
  }
    const { customer_file_number, name_to_match, customer_dob ,id } = req.body;

    if (!customer_file_number || !name_to_match || !customer_dob) {
      return res.status(400).json({ message: "Passport number and name are required" });
    }

    const passportData = {
      mode: "sync",
      data: {
        customer_file_number,
        name_to_match,
        customer_dob,
        consent: "Y",
        consent_text:
          "I hereby declare my consent agreement for fetching my information via ZOOP API",
      },
      task_id: "8bbb54f3-d299-4535-b00e-e74d2d5a3997",
    };


    const response = await axios.post(
      "https://test.zoop.one/api/v1/in/identity/passport/advance",
      passportData,
      {
        headers: {
          "app-id": "67b8252871c07100283cedc6",
          "api-key": "52HD084-W614E0Q-JQY5KJG-R8EW1TW",
          "Content-Type": "application/json",
        },
      }
    );
    const passportApiResponse = response.data;


      const updatedUser = await UserCartVerification.findByIdAndUpdate(
        id,
        {
          $set: {
            passport_response: passportApiResponse,
            status:"1"
          }
        },
        { new: true } 
      );
      
    res.status(200).json(response.data);
        // res.status(200);
  } catch (error) {
    res.status(200).json({
      message: "Passport verification failed",
      error: error.response ? error.response.data : error.message,
    });
  }
};

export const verifyDL = async (req, res) => {
  try {
    const { customer_dl_number, name_to_match, customer_dob,id } = req.body;

    if (!customer_dl_number || !name_to_match || !customer_dob) {
      return res.status(400).json({ message: "DL number, name, and DOB are required" });
    }

    const dlData = {
      mode: "sync",
      data: {
        customer_dl_number,
        name_to_match,
        customer_dob,
        consent: "Y",
        consent_text:
          "I hereby declare my consent agreement for fetching my information via ZOOP API"
      },
      task_id: "f26eb21e-4c35-4491-b2d5-41fa0e545a34"
    };


    const response = await axios.post(
      "https://test.zoop.one/api/v1/in/identity/dl/advance",
      dlData,
      {
        headers: {
          "app-id": "67b8252871c07100283cedc6",
          "api-key": "52HD084-W614E0Q-JQY5KJG-R8EW1TW",
          "Content-Type": "application/json"
        },
        timeout: 10000, // 10 seconds timeout
        maxRedirects: 10
      }
    );

    const dlApiResponse = response.data;

    const updatedUser = await UserCartVerification.findByIdAndUpdate(
      id,
      {
        $set: {
          dl_response: dlApiResponse,
      
        }
      },
      { new: true } 
    );


    res.status(200).json(response.data);
        // res.status(200);
  } catch (error) {
    res.status(500).json({
      message: "DL verification failed",
      error: error.response ? error.response.data : error.message
    });
  }
};







  
